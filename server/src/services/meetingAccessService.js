import mongoose from "mongoose";
import { Meeting } from "../models/Meeting.js";
import { Team } from "../models/Team.js";
import { HttpError } from "../utils/httpError.js";

export async function getJoinableMeeting(meetingId, userId) {
  if (!mongoose.isValidObjectId(meetingId)) throw new HttpError(400, "Invalid meeting id");

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) throw new HttpError(404, "Meeting not found");
  if (["ENDED", "CANCELLED"].includes(meeting.status)) {
    throw new HttpError(409, "Meeting is no longer joinable");
  }

  const isHost = String(meeting.host) === String(userId);
  const isParticipant = meeting.participants.some((id) => String(id) === String(userId));

  let isTeamMember = false;
  if (meeting.team) {
    isTeamMember = Boolean(await Team.exists({
      _id: meeting.team,
      $or: [{ owner: userId }, { members: userId }],
    }));
  }

  if (!isHost && !isParticipant && !isTeamMember) {
    throw new HttpError(403, "You do not have access to this meeting");
  }

  if (!isParticipant) {
    await Meeting.updateOne({ _id: meeting._id }, { $addToSet: { participants: userId } });
  }

  return meeting;
}

export async function requireMeetingParticipant(meetingId, userId) {
  if (!mongoose.isValidObjectId(meetingId)) throw new HttpError(400, "Invalid meeting id");

  const meeting = await Meeting.findOne({
    _id: meetingId,
    $or: [{ host: userId }, { participants: userId }],
  });
  if (!meeting) throw new HttpError(403, "Meeting access denied");
  return meeting;
}
