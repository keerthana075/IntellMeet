import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTranscriptResult } from "../src/ai/transcription/normalizeTranscript.js";
import { transcriptionBody } from "../src/validation/transcriptionSchemas.js";

test("normalizes Groq verbose transcript segments into milliseconds", () => {
  const result = normalizeTranscriptResult({
    text: " hello world ",
    language: "en",
    duration: 2.4,
    segments: [
      { start: 0.1, end: 1.25, text: " Hello " },
      { start: 1.25, end: 2.4, text: "world" },
    ],
    x_groq: { id: "req_test" },
  });

  assert.equal(result.text, "hello world");
  assert.equal(result.language, "en");
  assert.equal(result.durationSeconds, 2.4);
  assert.equal(result.segments[0].startMs, 100);
  assert.equal(result.segments[0].endMs, 1250);
  assert.equal(result.providerRequestId, "req_test");
});

test("transcription language validation accepts ISO-639-1 shape only", () => {
  assert.deepEqual(transcriptionBody.parse({ language: "en" }), { language: "en" });
  assert.throws(() => transcriptionBody.parse({ language: "english" }));
  assert.throws(() => transcriptionBody.parse({ language: "en-US" }));
});
