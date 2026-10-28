import "dotenv/config";
import http from "node:http";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { disconnectSocketRedisAdapter } from "./realtime/redisAdapter.js";
import { initializeRealtime } from "./realtime/socketServer.js";

const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);
  await initializeRealtime(server);

  server.listen(port, () => {
    console.log(`IntellMeet API listening on port ${port}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await Promise.allSettled([
        disconnectSocketRedisAdapter(),
        disconnectRedis(),
        disconnectDatabase(),
      ]);
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
