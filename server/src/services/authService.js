import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { AuthSession } from "../models/AuthSession.js";
import { User } from "../models/User.js";
import { getRefreshExpiryDate } from "../config/auth.js";
import { HttpError } from "../utils/httpError.js";
import { timingSafeEqual } from "node:crypto";


import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

const PASSWORD_ROUNDS = 12;
const googleClient = new OAuth2Client();

function sanitizeSessionMeta(meta = {}) {
  return {
    userAgent: typeof meta.userAgent === "string" ? meta.userAgent.slice(0, 512) : "",
    ip: typeof meta.ip === "string" ? meta.ip.slice(0, 128) : "",
  };
}

async function issueSessionTokens(user, meta = {}, existingSession = null) {
  const session = existingSession || new AuthSession({
    user: user._id,
    refreshTokenHash: "pending",
    expiresAt: getRefreshExpiryDate(),
    ...sanitizeSessionMeta(meta),
  });

  const refreshToken = signRefreshToken(user, session.id);
  const accessToken = signAccessToken(user, session.id);

  session.refreshTokenHash = await bcrypt.hash(refreshToken, PASSWORD_ROUNDS);
  session.expiresAt = getRefreshExpiryDate();
  session.revokedAt = null;
  await session.save();

  return { user, accessToken, refreshToken };
}

export async function registerUser({ name, email, password }, meta) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.exists({ email: normalizedEmail });
  if (existing) throw new HttpError(409, "Unable to create account with those credentials");

  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    authProvider: "LOCAL",
  });

  return issueSessionTokens(user, meta);
}
export async function registerAdminUser(
  { name, email, password, inviteCode },
  meta
) {
  const configuredCode = process.env.ADMIN_INVITE_CODE;

  if (!configuredCode || typeof inviteCode !== "string") {
    throw new HttpError(403, "Valid admin invitation code is required");
  }

  const provided = Buffer.from(inviteCode);
  const expected = Buffer.from(configuredCode);

  if (
    provided.length !== expected.length ||
    // !bcrypt.timingSafeEqual(provided, expected)
    // !timingSafeEqual(provided, expected)
    !timingSafeEqual(provided, expected)
  ) {
    throw new HttpError(403, "Valid admin invitation code is required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.exists({ email: normalizedEmail });

  if (existing) {
    throw new HttpError(409, "Unable to create account with those credentials");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "ADMIN",
    authProvider: "LOCAL",
  });

  return issueSessionTokens(user, meta);
}
export async function loginUser({ email, password }, meta) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  const valid = Boolean(user?.passwordHash) && await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Invalid email or password");

  return issueSessionTokens(user, meta);
}

export async function loginWithGoogle({ credential }, meta) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(503, "Google sign-in is not configured");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, "Invalid Google identity token");
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new HttpError(401, "Google account email is not verified");
  }

  const email = payload.email.trim().toLowerCase();
  let user = await User.findOne({ $or: [{ googleSubject: payload.sub }, { email }] }).select("+googleSubject");

  if (user && user.googleSubject && user.googleSubject !== payload.sub) {
    throw new HttpError(409, "Account identity conflict");
  }

  if (!user) {
    user = await User.create({
      name: (payload.name || email.split("@")[0]).slice(0, 80),
      email,
      authProvider: "GOOGLE",
      googleSubject: payload.sub,
    });
  } else if (!user.googleSubject) {
    user.googleSubject = payload.sub;
    await user.save();
  }

  return issueSessionTokens(user, meta);
}

export async function rotateRefreshToken(refreshToken, meta) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "Invalid or expired refresh session");
  }

  if (payload.type !== "refresh" || !payload.sid) {
    throw new HttpError(401, "Invalid refresh session");
  }

  const session = await AuthSession.findById(payload.sid).select("+refreshTokenHash");
  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new HttpError(401, "Refresh session has been revoked");
  }

  if (String(session.user) !== payload.sub || !(await bcrypt.compare(refreshToken, session.refreshTokenHash))) {
    session.revokedAt = new Date();
    await session.save();
    throw new HttpError(401, "Refresh token reuse detected");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    session.revokedAt = new Date();
    await session.save();
    throw new HttpError(401, "Account is no longer available");
  }

  Object.assign(session, sanitizeSessionMeta(meta));
  return issueSessionTokens(user, meta, session);
}

export async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.sid) {
      await AuthSession.findByIdAndUpdate(payload.sid, { $set: { revokedAt: new Date() } });
    }
  } catch {
    // Logout is intentionally idempotent even for stale/invalid tokens.
  }
}

export async function revokeAllUserSessions(userId) {
  await AuthSession.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
