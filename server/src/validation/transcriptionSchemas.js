import { z } from "zod";
import { objectId } from "./common.js";

export const transcriptionParams = z.object({
  meetingId: objectId,
  recordingId: objectId,
}).strict();

export const transcriptMeetingParams = z.object({
  meetingId: objectId,
}).strict();

export const transcriptionBody = z.object({
  language: z.string().trim().regex(/^[a-z]{2}$/i, "language must be an ISO-639-1 code").optional(),
}).strict();
