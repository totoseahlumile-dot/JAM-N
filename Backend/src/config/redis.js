import { createClient } from "redis";
import env from "./env.js";

let client;
let connectionPromise;
const getRedis = async () => {
  if (!env.redisUrl) return null;
  if (!client) {
    client = createClient({ url: env.redisUrl });
    client.on("error", (error) => console.error(JSON.stringify({ level: "error", event: "redis.error", message: error.message })));
    connectionPromise = client.connect();
  }
  await connectionPromise;
  return client;
};
const closeRedis = async () => { if (client?.isOpen) await client.quit(); };
export { closeRedis, getRedis };
