import { cloudinary, configureCloudinary, getCloudinaryPublicConfig } from "../config/cloudinary.js";
import { Meeting } from "../models/Meeting.js";
import { Recording } from "../models/Recording.js";
import { HttpError } from "../utils/httpError.js";
import { requireMeetingParticipant } from "./meetingAccessService.js";

const RECORDING_FOLDER = "intellmeet/recordings";
const MAX_RECORDING_BYTES = 500 * 1024 * 1024;

async function requireMeetingHost(meetingId, userId) {
  const meeting = await Meeting.findOne({ _id: meetingId, host: userId });
  if (!meeting) throw new HttpError(403, "Only the meeting host can manage recordings");
  if (meeting.status === "CANCELLED") throw new HttpError(409, "Cancelled meetings cannot be recorded");
  return meeting;
}

export async function createRecordingUpload(userId, meetingId) {
  await requireMeetingHost(meetingId, userId);
  configureCloudinary();

  const placeholder = await Recording.create({
    meeting: meetingId,
    uploadedBy: userId,
    publicId: `pending_${meetingId}_${Date.now()}`,
  });

  const publicIdBase = `meeting_${meetingId}_recording_${placeholder.id}`;
  const fullPublicId = `${RECORDING_FOLDER}/${publicIdBase}`;
  placeholder.publicId = fullPublicId;
  await placeholder.save();

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: RECORDING_FOLDER,
    public_id: publicIdBase,
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
  const { cloudName, apiKey } = getCloudinaryPublicConfig();

  return {
    recordingId: placeholder.id,
    cloudName,
    apiKey,
    signature,
    timestamp,
    folder: RECORDING_FOLDER,
    publicId: publicIdBase,
    resourceType: "video",
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
  };
}

export async function finalizeRecording(userId, meetingId, recordingId) {
  await requireMeetingHost(meetingId, userId);
  configureCloudinary();

  const recording = await Recording.findOne({
    _id: recordingId,
    meeting: meetingId,
    uploadedBy: userId,
  });
  if (!recording) throw new HttpError(404, "Recording upload not found");
  if (recording.status === "READY") return recording;
  if (recording.status !== "UPLOADING") throw new HttpError(409, "Recording cannot be finalized");

  let asset;
  try {
    asset = await cloudinary.api.resource(recording.publicId, {
      resource_type: "video",
      image_metadata: false,
      media_metadata: false,
    });
  } catch {
    throw new HttpError(409, "Cloudinary recording is not available yet");
  }

  if (!asset?.secure_url || asset.resource_type !== "video") {
    throw new HttpError(422, "Cloudinary asset is not a valid video recording");
  }
  if (Number(asset.bytes || 0) > MAX_RECORDING_BYTES) {
    recording.status = "FAILED";
    recording.failureReason = "Recording exceeds the configured size limit";
    await recording.save();
    throw new HttpError(413, "Recording exceeds the 500 MB limit");
  }

  recording.secureUrl = asset.secure_url;
  recording.format = asset.format || "";
  recording.bytes = Number(asset.bytes || 0);
  recording.durationSeconds = Number(asset.duration || 0);
  recording.status = "READY";
  recording.failureReason = "";
  await recording.save();

  return recording;
}

export async function listRecordings(userId, meetingId) {
  await requireMeetingParticipant(meetingId, userId);
  return Recording.find({ meeting: meetingId, status: { $ne: "DELETED" } })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name email");
}

export async function deleteRecording(userId, meetingId, recordingId) {
  await requireMeetingHost(meetingId, userId);
  const recording = await Recording.findOne({ _id: recordingId, meeting: meetingId });
  if (!recording) throw new HttpError(404, "Recording not found");
  if (recording.status === "DELETED") return;

  if (recording.status === "READY") {
    configureCloudinary();
    try {
      await cloudinary.uploader.destroy(recording.publicId, {
        resource_type: "video",
        invalidate: true,
      });
    } catch (error) {
      throw new HttpError(502, "Recording provider deletion failed", error?.message);
    }
  }

  recording.status = "DELETED";
  recording.secureUrl = "";
  await recording.save();
}
