import { z } from "zod";
import { idParams, objectId } from "./common.js";

const nullableDate = z.string().datetime({ offset: true }).or(z.string().datetime()).nullable();

export const createMeetingBody = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  team: objectId.nullable().optional(),
  scheduledAt: nullableDate.optional(),
}).strict();

export const updateMeetingBody = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  scheduledAt: nullableDate.optional(),
  status: z.enum(["SCHEDULED", "LIVE", "ENDED", "CANCELLED"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "at least one field must be provided",
});

export { idParams as meetingIdParams };
