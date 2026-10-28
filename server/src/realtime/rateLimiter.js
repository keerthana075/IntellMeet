export function createSocketRateLimiter({ limit = 30, windowMs = 10_000 } = {}) {
  const buckets = new Map();

  return function allow(key, now = Date.now()) {
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) {
      buckets.set(key, { startedAt: now, count: 1 });
      return true;
    }

    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
  };
}
