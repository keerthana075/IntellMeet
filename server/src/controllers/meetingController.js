import {
  createMeeting, deleteMeeting, getMeeting, listMeetings, updateMeeting,
} from "../services/meetingService.js";
import { HttpError } from "../utils/httpError.js";

export async function create(req, res, next) {
  try {
    if (typeof req.body?.title !== "string" || req.body.title.trim().length < 2) {
      throw new HttpError(400, "title must contain at least 2 characters");
    }
    const meeting = await createMeeting(req.auth.userId, req.body);
    res.status(201).json({ success: true, data: meeting });
  } catch (error) { next(error); }
}

export async function list(req, res, next) {
  try {
    const meetings = await listMeetings(req.auth.userId);
    res.json({ success: true, data: meetings });
  } catch (error) { next(error); }
}

export async function getById(req, res, next) {
  try {
    const meeting = await getMeeting(req.auth.userId, req.params.id);
    res.json({ success: true, data: meeting });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const meeting = await updateMeeting(req.auth.userId, req.params.id, req.body ?? {});
    res.json({ success: true, data: meeting });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    await deleteMeeting(req.auth.userId, req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
}
