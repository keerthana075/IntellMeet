function toMilliseconds(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 1000);
}

export function normalizeTranscriptResult(payload) {
  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  const segments = Array.isArray(payload?.segments)
    ? payload.segments
      .filter((segment) => typeof segment?.text === "string" && segment.text.trim())
      .map((segment) => ({
        startMs: toMilliseconds(segment.start),
        endMs: Math.max(toMilliseconds(segment.end), toMilliseconds(segment.start)),
        text: segment.text.trim(),
        speaker: "",
      }))
    : [];

  const durationSeconds = Number(payload?.duration);
  return {
    text,
    language: typeof payload?.language === "string" ? payload.language : "",
    durationSeconds: Number.isFinite(durationSeconds) && durationSeconds >= 0
      ? durationSeconds
      : segments.length
        ? segments[segments.length - 1].endMs / 1000
        : 0,
    segments,
    providerRequestId: typeof payload?.x_groq?.id === "string" ? payload.x_groq.id : "",
  };
}
