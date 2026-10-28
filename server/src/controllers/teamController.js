import { addTeamMember, createTeam, getTeamForMember } from "../services/teamService.js";
import { HttpError } from "../utils/httpError.js";

export async function create(req, res, next) {
  try {
    if (typeof req.body?.name !== "string" || req.body.name.trim().length < 2) {
      throw new HttpError(400, "name must contain at least 2 characters");
    }
    const team = await createTeam(req.auth.userId, req.body);
    res.status(201).json({ success: true, data: team });
  } catch (error) { next(error); }
}

export async function getById(req, res, next) {
  try {
    const team = await getTeamForMember(req.params.id, req.auth.userId);
    res.json({ success: true, data: team });
  } catch (error) { next(error); }
}

export async function addMember(req, res, next) {
  try {
    if (typeof req.body?.email !== "string") throw new HttpError(400, "email is required");
    const team = await addTeamMember(req.params.id, req.auth.userId, req.body.email);
    res.json({ success: true, data: team });
  } catch (error) { next(error); }
}
