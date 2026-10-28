import { Server } from "socket.io";
import { ChatMessage } from "../models/ChatMessage.js";
import { User } from "../models/User.js";
import { getJoinableMeeting, requireMeetingParticipant } from "../services/meetingAccessService.js";
import { authenticateSocket } from "./socketAuth.js";
import { createSocketRateLimiter } from "./rateLimiter.js";
import { configureSocketRedisAdapter } from "./redisAdapter.js";
import { validateMediaState, validateSignalPayload } from "./webrtc.js";

const roomName = (meetingId) => `meeting:${meetingId}`;
const allowEvent = createSocketRateLimiter();

function safeAck(ack, payload) {
  if (typeof ack === "function") ack(payload);
}

function serializeError(error) {
  const status = Number(error?.status) || 400;
  return {
    ok: false,
    error: status >= 500 ? "Realtime operation failed" : error?.message || "Realtime operation failed",
  };
}

async function relaySignal(io, socket, joinedMeetings, type, payload, ack) {
  try {
    if (!allowEvent(`${socket.id}:webrtc`)) throw new Error("Too many signaling requests");
    const signal = validateSignalPayload(type, payload);
    if (!joinedMeetings.has(signal.meetingId)) throw new Error("Join the meeting before signaling");

    const targetSocket = io.sockets.sockets.get(signal.targetSocketId);
    if (!targetSocket || !targetSocket.rooms.has(roomName(signal.meetingId))) {
      throw new Error("Target participant is not in this meeting");
    }
    if (targetSocket.id === socket.id) throw new Error("Cannot signal yourself");

    const outbound = {
      meetingId: signal.meetingId,
      fromSocketId: socket.id,
      fromUserId: socket.auth.userId,
    };
    if (signal.description) outbound.description = signal.description;
    if (signal.candidate) outbound.candidate = signal.candidate;

    io.to(targetSocket.id).emit(`webrtc:${type}`, outbound);
    safeAck(ack, { ok: true });
  } catch (error) {
    safeAck(ack, serializeError(error));
  }
}

export async function initializeRealtime(httpServer) {
  const origins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: origins.length ? origins : process.env.NODE_ENV === "production" ? [] : true,
      credentials: true,
    },
    maxHttpBufferSize: 1e6,
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  await configureSocketRedisAdapter(io);
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const joinedMeetings = new Set();

    socket.on("meeting:join", async (payload, ack) => {
      try {
        const meetingId = payload?.meetingId;
        if (typeof meetingId !== "string") throw new Error("meetingId is required");
        if (!allowEvent(`${socket.id}:join`)) throw new Error("Too many realtime requests");

        await getJoinableMeeting(meetingId, socket.auth.userId);
        await socket.join(roomName(meetingId));
        joinedMeetings.add(meetingId);

        const user = await User.findById(socket.auth.userId).select("name email role");
        const participants = await io.in(roomName(meetingId)).fetchSockets();

        socket.to(roomName(meetingId)).emit("participant:joined", {
          meetingId,
          socketId: socket.id,
          user: user?.toJSON() ?? { _id: socket.auth.userId },
        });

        safeAck(ack, {
          ok: true,
          meetingId,
          selfSocketId: socket.id,
          peers: participants
            .filter((peer) => peer.id !== socket.id)
            .map((peer) => ({
              socketId: peer.id,
              userId: peer.auth?.userId,
            })),
        });
      } catch (error) {
        safeAck(ack, serializeError(error));
      }
    });

    socket.on("meeting:leave", async (payload, ack) => {
      const meetingId = payload?.meetingId;
      if (typeof meetingId !== "string") return safeAck(ack, { ok: false, error: "meetingId is required" });

      await socket.leave(roomName(meetingId));
      joinedMeetings.delete(meetingId);
      socket.to(roomName(meetingId)).emit("participant:left", {
        meetingId,
        socketId: socket.id,
        userId: socket.auth.userId,
      });
      safeAck(ack, { ok: true });
    });

    socket.on("chat:send", async (payload, ack) => {
      try {
        const meetingId = payload?.meetingId;
        const text = typeof payload?.text === "string" ? payload.text.trim() : "";

        if (!meetingId || !text || text.length > 2000) {
          throw new Error("A meetingId and message up to 2000 characters are required");
        }
        if (!joinedMeetings.has(meetingId)) throw new Error("Join the meeting before sending chat");
        if (!allowEvent(`${socket.id}:chat`)) throw new Error("Too many chat messages");

        await requireMeetingParticipant(meetingId, socket.auth.userId);
        const message = await ChatMessage.create({
          meeting: meetingId,
          sender: socket.auth.userId,
          text,
        });
        await message.populate("sender", "name email");

        const event = {
          id: message.id,
          meetingId,
          sender: message.sender,
          text: message.text,
          createdAt: message.createdAt,
        };

        io.to(roomName(meetingId)).emit("chat:message", event);
        safeAck(ack, { ok: true, data: event });
      } catch (error) {
        safeAck(ack, serializeError(error));
      }
    });

    socket.on("webrtc:offer", (payload, ack) => relaySignal(io, socket, joinedMeetings, "offer", payload, ack));
    socket.on("webrtc:answer", (payload, ack) => relaySignal(io, socket, joinedMeetings, "answer", payload, ack));
    socket.on("webrtc:ice-candidate", (payload, ack) => relaySignal(io, socket, joinedMeetings, "ice-candidate", payload, ack));

    socket.on("media:state", (payload, ack) => {
      try {
        if (!allowEvent(`${socket.id}:media`)) throw new Error("Too many media state updates");
        const { meetingId, state } = validateMediaState(payload);
        if (!joinedMeetings.has(meetingId)) throw new Error("Join the meeting before updating media state");

        socket.to(roomName(meetingId)).emit("media:state", {
          meetingId,
          socketId: socket.id,
          userId: socket.auth.userId,
          ...state,
        });
        safeAck(ack, { ok: true });
      } catch (error) {
        safeAck(ack, serializeError(error));
      }
    });

    for (const eventName of ["typing:start", "typing:stop"]) {
      socket.on(eventName, (payload) => {
        const meetingId = payload?.meetingId;
        if (typeof meetingId === "string" && joinedMeetings.has(meetingId)) {
          socket.to(roomName(meetingId)).emit(eventName, { meetingId, userId: socket.auth.userId });
        }
      });
    }

    socket.on("disconnecting", () => {
      for (const meetingId of joinedMeetings) {
        socket.to(roomName(meetingId)).emit("participant:left", {
          meetingId,
          socketId: socket.id,
          userId: socket.auth.userId,
        });
      }
    });
  });

  return io;
}
