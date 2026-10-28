import mongoose from "mongoose";
import { ActionItem } from "../models/ActionItem.js";
import { Meeting } from "../models/Meeting.js";
import { Team } from "../models/Team.js";
import { HttpError } from "../utils/httpError.js";

function assertId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Invalid ${label}`);
}

async function requireMeetingAccess(meetingId, userId) {
  assertId(meetingId, "meeting id");
  const meeting = await Meeting.findOne({
    _id: meetingId,
    $or: [{ host: userId }, { participants: userId }],
  });
  if (!meeting) throw new HttpError(404, "Meeting not found");
  return meeting;
}

async function assertValidAssignee(meeting, assigneeId) {
  if (!assigneeId) return;
  assertId(assigneeId, "assignee id");

  const isParticipant = meeting.participants.some(
    (participantId) => String(participantId) === String(assigneeId)
  );
  if (isParticipant) return;

  if (meeting.team) {
    const teamMember = await Team.exists({
      _id: meeting.team,
      $or: [{ owner: assigneeId }, { members: assigneeId }],
    });
    if (teamMember) return;
  }

  throw new HttpError(422, "assignee must be a meeting participant or team member");
}

export async function createActionItem(userId, meetingId, payload) {
  const meeting = await requireMeetingAccess(meetingId, userId);
  await assertValidAssignee(meeting, payload.assignee);

  return ActionItem.create({
    meeting: meetingId,
    text: payload.text.trim(),
    assignee: payload.assignee ?? null,
    dueAt: payload.dueAt ?? null,
    source: "MANUAL",
  });
}

export async function listActionItems(userId, meetingId) {
  await requireMeetingAccess(meetingId, userId);
  return ActionItem.find({ meeting: meetingId })
    .sort({ createdAt: 1 })
    .populate("assignee", "name email");
}

export async function updateActionItem(userId, actionItemId, payload) {
  assertId(actionItemId, "action item id");
  const item = await ActionItem.findById(actionItemId);
  if (!item) throw new HttpError(404, "Action item not found");

  const meeting = await requireMeetingAccess(item.meeting, userId);
  if (meeting.status === "CANCELLED") {
    throw new HttpError(409, "Action items cannot be edited for a cancelled meeting");
  }
  if (payload.assignee !== undefined) {
    await assertValidAssignee(meeting, payload.assignee);
  }

  const allowed = ["text", "assignee", "dueAt", "status"];
  for (const key of allowed) {
    if (payload[key] !== undefined) item[key] = payload[key];
  }

  await item.save();
  return item.populate("assignee", "name email");
}
