import test from "node:test";
import assert from "node:assert/strict";
import { getRefreshCookieOptions } from "../src/config/auth.js";
import { parseDuration } from "../src/utils/duration.js";
import { validatePasswordStrength } from "../src/utils/passwordPolicy.js";

test("duration parser supports deployment TTL syntax", () => {
  assert.equal(parseDuration("15m", 0), 900000);
  assert.equal(parseDuration("7d", 0), 604800000);
  assert.equal(parseDuration("invalid", 42), 42);
});

test("password policy rejects weak passwords", () => {
  assert.ok(validatePasswordStrength("password").length > 0);
  assert.deepEqual(validatePasswordStrength("StrongPass1"), []);
});

test("refresh cookie is httpOnly and scoped to auth routes", () => {
  const previousEnv = process.env.NODE_ENV;
  const previousSecure = process.env.AUTH_COOKIE_SECURE;
  process.env.NODE_ENV = "test";
  process.env.AUTH_COOKIE_SECURE = "false";

  const options = getRefreshCookieOptions();
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, false);
  assert.equal(options.path, "/api/auth");

  process.env.NODE_ENV = previousEnv;
  process.env.AUTH_COOKIE_SECURE = previousSecure;
});
