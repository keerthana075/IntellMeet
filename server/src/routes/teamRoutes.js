import { Router } from "express";
import { addMember, create, getById } from "../controllers/teamController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { addTeamMemberBody, createTeamBody, teamIdParams } from "../validation/teamSchemas.js";

const router = Router();
router.use(requireAuth);
router.post("/", validate({ body: createTeamBody }), create);
router.get("/:id", validate({ params: teamIdParams }), getById);
router.post("/:id/members", validate({ params: teamIdParams, body: addTeamMemberBody }), addMember);

export default router;
