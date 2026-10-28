import { HttpError } from "../utils/httpError.js";
import { verifyAccessToken } from "../utils/tokens.js";

export function requireAuth(req, _res, next) {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sid,
    };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired access token"));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new HttpError(403, "Insufficient permissions"));
    }
    next();
  };
}
