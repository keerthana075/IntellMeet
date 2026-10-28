import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "must be a valid ObjectId");
export const optionalObjectId = objectId.nullable().optional();
export const isoDateString = z.string().datetime({ offset: true }).or(z.string().datetime()).nullable().optional();

export const idParams = z.object({ id: objectId });
export const meetingIdParams = z.object({ meetingId: objectId });
