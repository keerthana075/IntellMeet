import { getCurrentUser, updateCurrentUser } from "../services/userService.js";

export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.auth.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await updateCurrentUser(req.auth.userId, req.body ?? {});
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
