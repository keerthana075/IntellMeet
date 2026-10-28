import { getTranscriptionProvider } from "../ai/transcription/providerFactory.js";
import { Meeting } from "../models/Meeting.js";
import { Recording } from "../models/Recording.js";
import { Transcript } from "../models/Transcript.js";
import { HttpError } from "../utils/httpError.js";
import { requireMeetingParticipant } from "./meetingAccessService.js";

async function requireMeetingHost(meetingId, userId) {
  const meeting = await Meeting.findOne({ _id: meetingId, host: userId });
  if (!meeting) throw new HttpError(403, "Only the meeting host can start transcription");
  return meeting;
}

export async function transcribeRecording(userId, meetingId, recordingId, { language } = {}) {
  await requireMeetingHost(meetingId, userId);

  const recording = await Recording.findOne({
    _id: recordingId,
    meeting: meetingId,
    status: "READY",
  });
  if (!recording) throw new HttpError(404, "A ready recording was not found");

  let transcript = await Transcript.findOne({ meeting: meetingId, recording: recordingId });
  if (transcript?.status === "COMPLETED") return transcript;
  if (transcript?.status === "PROCESSING") {
    throw new HttpError(409, "Transcription is already processing");
  }

  const provider = getTranscriptionProvider();

  if (!transcript) {
    transcript = await Transcript.create({
      meeting: meetingId,
      recording: recordingId,
      requestedBy: userId,
      provider: provider.name,
      model: provider.model,
      status: "PROCESSING",
    });
  } else {
    transcript.status = "PROCESSING";
    transcript.failureReason = "";
    transcript.provider = provider.name;
    transcript.model = provider.model;
    transcript.requestedBy = userId;
    await transcript.save();
  }

  try {
    const result = await provider.transcribeFromUrl({
      url: recording.secureUrl,
      language: typeof language === "string" && language.trim() ? language.trim().toLowerCase() : undefined,
    });

    transcript.provider = result.provider;
    transcript.model = result.model;
    transcript.language = result.language;
    transcript.text = result.text;
    transcript.durationSeconds = result.durationSeconds;
    transcript.segments = result.segments;
    transcript.providerRequestId = result.providerRequestId;
    transcript.status = "COMPLETED";
    transcript.failureReason = "";
    transcript.completedAt = new Date();
    await transcript.save();

    return transcript;
  } catch (error) {
    transcript.status = "FAILED";
    transcript.failureReason = String(error?.message || "Transcription failed").slice(0, 500);
    await transcript.save();
    throw new HttpError(502, "Transcription failed", transcript.failureReason);
  }
}

export async function getMeetingTranscript(userId, meetingId) {
  await requireMeetingParticipant(meetingId, userId);

  return Transcript.find({ meeting: meetingId })
    .sort({ createdAt: -1 })
    .populate("recording", "secureUrl durationSeconds format status")
    .populate("requestedBy", "name email");
}
