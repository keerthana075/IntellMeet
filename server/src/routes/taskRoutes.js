import { Router } from "express";
import { create, list, remove, update } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTaskBody, listTasksQuery, taskIdParams, updateTaskBody } from "../validation/taskSchemas.js";

const router = Router();
router.use(requireAuth);
router.post("/", validate({ body: createTaskBody }), create);
router.get("/", validate({ query: listTasksQuery }), list);
router.patch("/:id", validate({ params: taskIdParams, body: updateTaskBody }), update);
router.delete("/:id", validate({ params: taskIdParams }), remove);

export default router;
