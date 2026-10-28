import {
  getMeetingTranscript,
  transcribeRecording,
} from "../services/transcriptionService.js";

export async function create(req, res, next) {
  try {
    const transcript = await transcribeRecording(
      req.auth.userId,
      req.params.meetingId,
      req.params.recordingId,
      req.body ?? {}
    );
    res.status(200).json({ success: true, data: transcript });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const transcripts = await getMeetingTranscript(req.auth.userId, req.params.meetingId);
    res.json({ success: true, data: transcripts });
  } catch (error) {
    next(error);
  }
}
