import {
  createRecordingUpload,
  deleteRecording,
  finalizeRecording,
  listRecordings,
} from "../services/recordingService.js";

export async function createUpload(req, res, next) {
  try {
    const data = await createRecordingUpload(req.auth.userId, req.params.meetingId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function completeUpload(req, res, next) {
  try {
    const recording = await finalizeRecording(
      req.auth.userId,
      req.params.meetingId,
      req.params.recordingId
    );
    res.json({ success: true, data: recording });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const recordings = await listRecordings(req.auth.userId, req.params.meetingId);
    res.json({ success: true, data: recordings });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteRecording(req.auth.userId, req.params.meetingId, req.params.recordingId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
