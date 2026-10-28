import {
  createActionItem,
  listActionItems,
  updateActionItem,
} from "../services/actionItemService.js";

export async function create(req, res, next) {
  try {
    const item = await createActionItem(req.auth.userId, req.params.meetingId, req.body ?? {});
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
}

export async function list(req, res, next) {
  try {
    const items = await listActionItems(req.auth.userId, req.params.meetingId);
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const item = await updateActionItem(req.auth.userId, req.params.id, req.body ?? {});
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
}
