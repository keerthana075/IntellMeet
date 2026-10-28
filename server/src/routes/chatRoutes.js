import { Router } from "express";
import { listMeetingMessages } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { meetingIdParams } from "../validation/common.js";

const router = Router();

router.get(
  "/meetings/:meetingId/messages",
  requireAuth,
  validate({ params: meetingIdParams }),
  listMeetingMessages
);

export default router;
