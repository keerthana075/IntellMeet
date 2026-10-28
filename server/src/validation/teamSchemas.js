import { z } from "zod";
import { idParams } from "./common.js";

export const createTeamBody = z.object({
  name: z.string().trim().min(2).max(100),
}).strict();

export const addTeamMemberBody = z.object({
  email: z.string().trim().email().max(254),
}).strict();

export { idParams as teamIdParams };
