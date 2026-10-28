import { HttpError } from "../utils/httpError.js";

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, error: "Resource already exists" });
  }

  const status = error instanceof HttpError ? error.status : 500;
  const body = {
    success: false,
    error: status === 500 ? "Internal server error" : error.message,
  };

  if (error instanceof HttpError && error.details) body.details = error.details;
  if (status === 500 && process.env.NODE_ENV !== "test") console.error(error);

  res.status(status).json(body);
}
