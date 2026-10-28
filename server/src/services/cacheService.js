import { getRedisClient } from "../config/redis.js";

export async function getJson(key) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Redis GET failed:", error.message);
    return null;
  }
}

export async function setJson(key, value, ttlSeconds = 60) {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error("Redis SET failed:", error.message);
  }
}

export async function deleteKey(key) {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (error) {
    console.error("Redis DEL failed:", error.message);
  }
}
