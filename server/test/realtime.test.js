import test from "node:test";
import assert from "node:assert/strict";
import { createSocketRateLimiter } from "../src/realtime/rateLimiter.js";

test("socket rate limiter enforces a bounded event window", () => {
  const allow = createSocketRateLimiter({ limit: 2, windowMs: 1000 });

  assert.equal(allow("socket-1", 0), true);
  assert.equal(allow("socket-1", 10), true);
  assert.equal(allow("socket-1", 20), false);
  assert.equal(allow("socket-1", 1001), true);
  assert.equal(allow("socket-2", 20), true);
});
