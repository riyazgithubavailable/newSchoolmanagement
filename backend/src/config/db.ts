// MongoDB (Atlas) connection via Mongoose.

import mongoose from "mongoose";
import { env } from "./env.js";

/** Hide the password when printing a connection string */
const redact = (uri: string) => uri.replace(/\/\/([^:/]+):[^@]+@/, "//$1:****@");

const STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const dbState = () => STATES[mongoose.connection.readyState] ?? "unknown";

/** Thrown after the reason has already been printed */
export class DbConnectionError extends Error {}

export async function connectDB(): Promise<void> {
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => console.log("🔄 MongoDB reconnected"));
  mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err.message));

  console.log(`⏳ Connecting to MongoDB ${redact(env.mongoUri)} ...`);
  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
      serverSelectionTimeoutMS: 10_000,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Could not connect to MongoDB: ${msg}`);
    if (/ENOTFOUND|querySrv/i.test(msg)) {
      console.error("   → Cluster address not found. Copy the connection string again from Atlas → Connect → Drivers.");
    } else if (/auth|password/i.test(msg)) {
      console.error("   → Wrong database user / password in MONGODB_URI (Atlas → Security → Database Access).");
      console.error("     If the password has special characters like @ : / # %, URL-encode them.");
    } else if (/whitelist|ECONNREFUSED|timed out|Server selection/i.test(msg)) {
      console.error("   → Check Atlas → Security → Network Access: is your current IP address added?");
    }
    throw new DbConnectionError(msg);
  }
  const { host, name } = mongoose.connection;
  console.log(`✅ MongoDB connected → host: ${host}, database: ${name}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
