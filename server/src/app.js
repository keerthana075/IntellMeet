import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import actionItemRoutes from "./routes/actionItemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import transcriptionRoutes from "./routes/transcriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

function resolveCorsOrigin(origin, callback) {
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!origin || (process.env.NODE_ENV !== "production" && allowedOrigins.length === 0)) {
    return callback(null, true);
  }

  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin is not allowed by CORS"));
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors({
    origin: resolveCorsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      service: "intellmeet-api",
      status: "ok",
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/meetings", meetingRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/media", mediaRoutes);
  app.use("/api", transcriptionRoutes);
  app.use("/api", recordingRoutes);
  app.use("/api", chatRoutes);
  app.use("/api", actionItemRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
