import { ChatMessage } from "../models/ChatMessage.js";
import { requireMeetingParticipant } from "../services/meetingAccessService.js";

export async function listMeetingMessages(req, res, next) {
  try {
    await requireMeetingParticipant(req.params.meetingId, req.auth.userId);
    const messages = await ChatMessage.find({ meeting: req.params.meetingId })
      .sort({ createdAt: 1 })
      .limit(500)
      .populate("sender", "name email");

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
}
