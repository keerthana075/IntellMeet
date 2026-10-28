const UNITS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDuration(value, fallbackMs) {
  if (typeof value !== "string") return fallbackMs;
  const match = value.trim().match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return fallbackMs;
  return Number(match[1]) * UNITS[match[2].toLowerCase()];
}
