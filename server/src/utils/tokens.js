import jwt from "jsonwebtoken";

function requireSecret(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  if (process.env.NODE_ENV === "production" && value.length < 32) {
    throw new Error(`${name} must contain at least 32 characters in production`);
  }
  return value;
}

export function signAccessToken(user, sessionId) {
  return jwt.sign(
    { sub: user.id, role: user.role, sid: sessionId },
    requireSecret("JWT_ACCESS_SECRET"),
    { expiresIn: process.env.JWT_ACCESS_TTL || "15m" }
  );
}

export function signRefreshToken(user, sessionId) {
  return jwt.sign(
    { sub: user.id, sid: sessionId, type: "refresh" },
    requireSecret("JWT_REFRESH_SECRET"),
    { expiresIn: process.env.JWT_REFRESH_TTL || "7d" }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, requireSecret("JWT_ACCESS_SECRET"));
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, requireSecret("JWT_REFRESH_SECRET"));
}
