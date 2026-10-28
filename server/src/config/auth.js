import { parseDuration } from "../utils/duration.js";

const DEFAULT_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export function getRefreshCookieName() {
  return process.env.AUTH_COOKIE_NAME || "intellmeet_refresh";
}

export function getRefreshCookieOptions() {
  const sameSite = (process.env.AUTH_COOKIE_SAME_SITE || "lax").toLowerCase();
  const secure = process.env.AUTH_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure,
    sameSite: ["lax", "strict", "none"].includes(sameSite) ? sameSite : "lax",
    path: "/api/auth",
    maxAge: parseDuration(process.env.JWT_REFRESH_TTL || "7d", DEFAULT_REFRESH_MS),
  };
}

export function getRefreshExpiryDate() {
  return new Date(Date.now() + parseDuration(process.env.JWT_REFRESH_TTL || "7d", DEFAULT_REFRESH_MS));
}
