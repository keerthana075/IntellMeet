const MAX_SDP_LENGTH = 200_000;
const MAX_CANDIDATE_LENGTH = 8_000;

export function validateSignalPayload(type, payload) {
  const meetingId = payload?.meetingId;
  const targetSocketId = payload?.targetSocketId;

  if (typeof meetingId !== "string" || meetingId.length < 1) {
    throw new Error("meetingId is required");
  }
  if (typeof targetSocketId !== "string" || targetSocketId.length < 1 || targetSocketId.length > 200) {
    throw new Error("targetSocketId is required");
  }

  if (type === "offer" || type === "answer") {
    const description = payload?.description;
    if (
      !description ||
      description.type !== type ||
      typeof description.sdp !== "string" ||
      description.sdp.length < 1 ||
      description.sdp.length > MAX_SDP_LENGTH
    ) {
      throw new Error(`A valid WebRTC ${type} description is required`);
    }
    return { meetingId, targetSocketId, description };
  }

  if (type === "ice-candidate") {
    const candidate = payload?.candidate;
    if (
      !candidate ||
      typeof candidate.candidate !== "string" ||
      candidate.candidate.length > MAX_CANDIDATE_LENGTH
    ) {
      throw new Error("A valid ICE candidate is required");
    }

    return {
      meetingId,
      targetSocketId,
      candidate: {
        candidate: candidate.candidate,
        sdpMid: typeof candidate.sdpMid === "string" ? candidate.sdpMid : null,
        sdpMLineIndex: Number.isInteger(candidate.sdpMLineIndex) ? candidate.sdpMLineIndex : null,
        usernameFragment: typeof candidate.usernameFragment === "string" ? candidate.usernameFragment : null,
      },
    };
  }

  throw new Error("Unsupported WebRTC signal");
}

export function validateMediaState(payload) {
  const meetingId = payload?.meetingId;
  if (typeof meetingId !== "string" || meetingId.length < 1) throw new Error("meetingId is required");

  const state = {};
  for (const field of ["audioEnabled", "videoEnabled", "screenSharing"]) {
    if (payload[field] !== undefined) {
      if (typeof payload[field] !== "boolean") throw new Error(`${field} must be boolean`);
      state[field] = payload[field];
    }
  }

  if (Object.keys(state).length === 0) throw new Error("At least one media state is required");
  return { meetingId, state };
}
