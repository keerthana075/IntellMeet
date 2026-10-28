import { Router } from "express";
import { create, list, update } from "../controllers/actionItemController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  actionItemIdParams,
  createActionItemBody,
  meetingIdParams,
  updateActionItemBody,
} from "../validation/actionItemSchemas.js";

const router = Router();

router.use(requireAuth);
router.post(
  "/meetings/:meetingId/action-items",
  validate({ params: meetingIdParams, body: createActionItemBody }),
  create
);
router.get(
  "/meetings/:meetingId/action-items",
  validate({ params: meetingIdParams }),
  list
);
router.patch(
  "/action-items/:id",
  validate({ params: actionItemIdParams, body: updateActionItemBody }),
  update
);

export default router;
