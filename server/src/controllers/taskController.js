import { createTask, deleteTask, listTasks, updateTask } from "../services/taskService.js";
import { HttpError } from "../utils/httpError.js";

export async function create(req, res, next) {
  try {
    if (typeof req.body?.title !== "string" || req.body.title.trim().length < 2) {
      throw new HttpError(400, "title must contain at least 2 characters");
    }
    if (!req.body?.team) throw new HttpError(400, "team is required");
    const task = await createTask(req.auth.userId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
}

export async function list(req, res, next) {
  try {
    if (!req.query.team) throw new HttpError(400, "team query parameter is required");
    const tasks = await listTasks(req.auth.userId, req.query.team);
    res.json({ success: true, data: tasks });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const task = await updateTask(req.auth.userId, req.params.id, req.body ?? {});
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    await deleteTask(req.auth.userId, req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
}
