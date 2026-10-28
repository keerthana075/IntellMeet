import { createClient } from "redis";

let client;

export async function connectRedis(url = process.env.REDIS_URL) {
  if (!url) {
    console.warn("REDIS_URL is not configured; cache is disabled");
    return null;
  }

  if (!client) {
    client = createClient({ url });
    client.on("error", (error) => {
      console.error("Redis error:", error.message);
    });
  }

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

export function getRedisClient() {
  return client?.isOpen ? client : null;
}

export async function disconnectRedis() {
  if (client?.isOpen) {
    await client.quit();
  }
}
