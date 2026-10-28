import test from "node:test";
import assert from "node:assert/strict";
import { recordingMeetingParams, recordingParams } from "../src/validation/recordingSchemas.js";

test("recording params require valid Mongo ObjectIds", () => {
  const valid = "507f1f77bcf86cd799439011";
  assert.equal(recordingMeetingParams.parse({ meetingId: valid }).meetingId, valid);
  assert.throws(() => recordingMeetingParams.parse({ meetingId: "bad" }));
  assert.throws(() => recordingParams.parse({ meetingId: valid, recordingId: "bad" }));
});
