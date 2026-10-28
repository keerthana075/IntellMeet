import test from "node:test";
import assert from "node:assert/strict";
import { validateMediaState, validateSignalPayload } from "../src/realtime/webrtc.js";

test("WebRTC offer validation accepts bounded SDP", () => {
  const result = validateSignalPayload("offer", {
    meetingId: "meeting-1",
    targetSocketId: "socket-2",
    description: { type: "offer", sdp: "v=0" },
  });

  assert.equal(result.description.type, "offer");
  assert.equal(result.targetSocketId, "socket-2");
});

test("WebRTC signaling rejects mismatched description type", () => {
  assert.throws(() => validateSignalPayload("answer", {
    meetingId: "meeting-1",
    targetSocketId: "socket-2",
    description: { type: "offer", sdp: "v=0" },
  }));
});

test("media state only allows booleans", () => {
  assert.deepEqual(validateMediaState({
    meetingId: "meeting-1",
    audioEnabled: true,
    videoEnabled: false,
  }).state, { audioEnabled: true, videoEnabled: false });

  assert.throws(() => validateMediaState({ meetingId: "meeting-1", screenSharing: "yes" }));
});
