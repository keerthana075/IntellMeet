import { HttpError } from "../utils/httpError.js";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, _res, next) {
  const { name, email, password } = req.body ?? {};
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    errors.push("name must contain between 2 and 80 characters");
  }
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim()) || email.length > 254) {
    errors.push("email must be valid");
  }
  errors.push(...validatePasswordStrength(password));

  if (errors.length) return next(new HttpError(400, "Invalid registration data", errors));
  next();
}

export function validateLogin(req, _res, next) {
  const { email, password } = req.body ?? {};
  if (
    typeof email !== "string" ||
    !EMAIL_PATTERN.test(email.trim()) ||
    typeof password !== "string" ||
    password.length > 256
  ) {
    return next(new HttpError(400, "Invalid login data"));
  }
  next();
}

export function validateGoogleLogin(req, _res, next) {
  const { credential } = req.body ?? {};
  if (typeof credential !== "string" || credential.length < 20 || credential.length > 10000) {
    return next(new HttpError(400, "A valid Google credential is required"));
  }
  next();
}
