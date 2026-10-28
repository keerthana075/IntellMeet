import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function updateCurrentUser(userId, payload) {
  const update = {};
  if (typeof payload.name === "string") {
    const name = payload.name.trim();
    if (name.length < 2 || name.length > 80) {
      throw new HttpError(400, "name must be between 2 and 80 characters");
    }
    update.name = name;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!user) throw new HttpError(404, "User not found");
  return user;
}
