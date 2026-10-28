import { z } from "zod";
import { objectId } from "./common.js";

export const recordingMeetingParams = z.object({
  meetingId: objectId,
}).strict();

export const recordingParams = z.object({
  meetingId: objectId,
  recordingId: objectId,
}).strict();
