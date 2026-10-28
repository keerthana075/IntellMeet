import { z } from "zod";
import { idParams, meetingIdParams, objectId } from "./common.js";

const nullableDate = z.string().datetime({ offset: true }).or(z.string().datetime()).nullable();

export const createActionItemBody = z.object({
  text: z.string().trim().min(2).max(500),
  assignee: objectId.nullable().optional(),
  dueAt: nullableDate.optional(),
}).strict();

export const updateActionItemBody = z.object({
  text: z.string().trim().min(2).max(500).optional(),
  assignee: objectId.nullable().optional(),
  dueAt: nullableDate.optional(),
  status: z.enum(["OPEN", "DONE", "DISMISSED"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "at least one field must be provided",
});

export { idParams as actionItemIdParams, meetingIdParams };
