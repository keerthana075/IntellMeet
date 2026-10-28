import { Router } from "express";
import { create, list } from "../controllers/transcriptionController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  transcriptMeetingParams,
  transcriptionBody,
  transcriptionParams,
} from "../validation/transcriptionSchemas.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/meetings/:meetingId/recordings/:recordingId/transcription",
  validate({ params: transcriptionParams, body: transcriptionBody }),
  create
);

router.get(
  "/meetings/:meetingId/transcripts",
  validate({ params: transcriptMeetingParams }),
  list
);

export default router;
