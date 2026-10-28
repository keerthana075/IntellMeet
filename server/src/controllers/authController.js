
import {
  loginUser,
  loginWithGoogle,
  registerAdminUser,
  registerUser,
  revokeAllUserSessions,
  revokeRefreshToken,
  rotateRefreshToken,
} from "../services/authService.js";
import { getRefreshCookieName, getRefreshCookieOptions } from "../config/auth.js";
import { HttpError } from "../utils/httpError.js";

function requestMeta(req) {
  return {
    userAgent: req.get("user-agent") || "",
    ip: req.ip || "",
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(getRefreshCookieName(), refreshToken, getRefreshCookieOptions());
}

function publicAuthResult(result) {
  return { user: result.user, accessToken: result.accessToken };
}

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body, requestMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ success: true, data: publicAuthResult(result) });
  } catch (error) {
    next(error);
  }
}
export async function registerAdmin(req, res, next) {
  try {
    const result = await registerAdminUser(req.body, requestMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ success: true, data: publicAuthResult(result) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body, requestMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ success: true, data: publicAuthResult(result) });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const result = await loginWithGoogle(req.body, requestMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ success: true, data: publicAuthResult(result) });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[getRefreshCookieName()];
    if (!refreshToken) throw new HttpError(401, "Refresh session is required");

    const result = await rotateRefreshToken(refreshToken, requestMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ success: true, data: publicAuthResult(result) });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[getRefreshCookieName()];
    await revokeRefreshToken(refreshToken);
    res.clearCookie(getRefreshCookieName(), getRefreshCookieOptions());
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req, res, next) {
  try {
    await revokeAllUserSessions(req.auth.userId);
    res.clearCookie(getRefreshCookieName(), getRefreshCookieOptions());
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
