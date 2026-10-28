import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

let pubClient;
let subClient;

export async function configureSocketRedisAdapter(io, url = process.env.REDIS_URL) {
  if (!url) return false;

  try {
    pubClient = createClient({ url });
    subClient = pubClient.duplicate();

    const onError = (error) => console.error("Socket Redis adapter error:", error.message);
    pubClient.on("error", onError);
    subClient.on("error", onError);

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return true;
  } catch (error) {
    console.warn("Socket Redis adapter unavailable; using in-memory adapter:", error.message);
    await disconnectSocketRedisAdapter();
    return false;
  }
}

export async function disconnectSocketRedisAdapter() {
  const clients = [pubClient, subClient].filter(Boolean);
  await Promise.allSettled(clients.map((client) => client.isOpen ? client.quit() : Promise.resolve()));
  pubClient = undefined;
  subClient = undefined;
}
