import { z } from "zod";
import { idParams, objectId } from "./common.js";

const nullableDate = z.string().datetime({ offset: true }).or(z.string().datetime()).nullable();

export const createTaskBody = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  team: objectId,
  meeting: objectId.nullable().optional(),
  assignee: objectId.nullable().optional(),
  dueAt: nullableDate.optional(),
}).strict();

export const updateTaskBody = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  assignee: objectId.nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueAt: nullableDate.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "at least one field must be provided",
});

export const listTasksQuery = z.object({
  team: objectId,
}).strict();

export { idParams as taskIdParams };
