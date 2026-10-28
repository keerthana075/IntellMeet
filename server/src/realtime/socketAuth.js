import { verifyAccessToken } from "../utils/tokens.js";

export function authenticateSocket(socket, next) {
  const headerToken = socket.handshake.auth?.token;
  const authorization = socket.handshake.headers?.authorization;
  const bearerToken = typeof authorization === "string" && authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  const token = headerToken || bearerToken;

  if (!token || typeof token !== "string") {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload.sub) return next(new Error("Invalid access token"));
    socket.auth = {
      userId: payload.sub,
      role: payload.role,
      sessionId: payload.sid,
    };
    next();
  } catch {
    next(new Error("Invalid or expired access token"));
  }
}
