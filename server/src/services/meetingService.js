import mongoose from "mongoose";
import { Meeting } from "../models/Meeting.js";
import { Team } from "../models/Team.js";
import { HttpError } from "../utils/httpError.js";
import { deleteKey, getJson, setJson } from "./cacheService.js";

const meetingCacheKey = (meetingId, userId) => `meeting:${meetingId}:viewer:${userId}`;

const STATUS_TRANSITIONS = {
  SCHEDULED: new Set(["LIVE", "CANCELLED"]),
  LIVE: new Set(["ENDED"]),
  ENDED: new Set(),
  CANCELLED: new Set(),
};

function assertId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Invalid ${label}`);
}

async function assertTeamAccess(teamId, userId) {
  if (!teamId) return;
  assertId(teamId, "team id");
  const allowed = await Team.exists({
    _id: teamId,
    $or: [{ owner: userId }, { members: userId }],
  });
  if (!allowed) throw new HttpError(403, "You do not have access to this team");
}

export async function createMeeting(userId, payload) {
  await assertTeamAccess(payload.team, userId);

  return Meeting.create({
    title: payload.title.trim(),
    description: payload.description?.trim() ?? "",
    host: userId,
    team: payload.team ?? null,
    participants: [userId],
    scheduledAt: payload.scheduledAt ?? null,
  });
}

export async function listMeetings(userId) {
  return Meeting.find({
    $or: [{ host: userId }, { participants: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("host", "name email")
    .populate("team", "name");
}

export async function getMeeting(userId, meetingId) {
  assertId(meetingId, "meeting id");

  const cacheKey = meetingCacheKey(meetingId, userId);
  const cached = await getJson(cacheKey);
  if (cached) return cached;

  const meeting = await Meeting.findOne({
    _id: meetingId,
    $or: [{ host: userId }, { participants: userId }],
  })
    .populate("host", "name email")
    .populate("participants", "name email")
    .populate("team", "name");

  if (!meeting) throw new HttpError(404, "Meeting not found");

  const serialized = meeting.toJSON();
  await setJson(cacheKey, serialized, 60);
  return serialized;
}

export async function updateMeeting(userId, meetingId, payload) {
  assertId(meetingId, "meeting id");
  const meeting = await Meeting.findOne({ _id: meetingId, host: userId });
  if (!meeting) throw new HttpError(404, "Meeting not found or you are not the host");

  if (payload.status && payload.status !== meeting.status) {
    if (!STATUS_TRANSITIONS[meeting.status]?.has(payload.status)) {
      throw new HttpError(409, `Invalid meeting status transition: ${meeting.status} -> ${payload.status}`);
    }

    if (payload.status === "LIVE" && !meeting.startedAt) meeting.startedAt = new Date();
    if (payload.status === "ENDED" && !meeting.endedAt) meeting.endedAt = new Date();
  }

  const allowed = ["title", "description", "scheduledAt", "status"];
  for (const key of allowed) {
    if (payload[key] !== undefined) meeting[key] = payload[key];
  }

  await meeting.save();
  await deleteKey(meetingCacheKey(meetingId, userId));
  return meeting;
}

export async function deleteMeeting(userId, meetingId) {
  assertId(meetingId, "meeting id");
  const meeting = await Meeting.findOne({ _id: meetingId, host: userId });
  if (!meeting) throw new HttpError(404, "Meeting not found or you are not the host");
  if (meeting.status === "LIVE") throw new HttpError(409, "A live meeting cannot be deleted");

  await meeting.deleteOne();
  await deleteKey(meetingCacheKey(meetingId, userId));
}
