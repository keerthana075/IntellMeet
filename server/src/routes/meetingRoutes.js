import { Router } from "express";
import { create, getById, list, remove, update } from "../controllers/meetingController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createMeetingBody, meetingIdParams, updateMeetingBody } from "../validation/meetingSchemas.js";

const router = Router();
router.use(requireAuth);
router.post("/", validate({ body: createMeetingBody }), create);
router.get("/", list);
router.get("/:id", validate({ params: meetingIdParams }), getById);
router.patch("/:id", validate({ params: meetingIdParams, body: updateMeetingBody }), update);
router.delete("/:id", validate({ params: meetingIdParams }), remove);

export default router;
