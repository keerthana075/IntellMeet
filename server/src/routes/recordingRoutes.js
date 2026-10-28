import { Router } from "express";
import {
  completeUpload,
  createUpload,
  list,
  remove,
} from "../controllers/recordingController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recordingMeetingParams, recordingParams } from "../validation/recordingSchemas.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/meetings/:meetingId/recordings/upload",
  validate({ params: recordingMeetingParams }),
  createUpload
);
router.post(
  "/meetings/:meetingId/recordings/:recordingId/complete",
  validate({ params: recordingParams }),
  completeUpload
);
router.get(
  "/meetings/:meetingId/recordings",
  validate({ params: recordingMeetingParams }),
  list
);
router.delete(
  "/meetings/:meetingId/recordings/:recordingId",
  validate({ params: recordingParams }),
  remove
);

export default router;
