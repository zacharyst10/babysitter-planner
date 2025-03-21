import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Make sure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Parse connection string into components for Drizzle
const url = new URL(process.env.DATABASE_URL);
const host = url.hostname;
const port = parseInt(url.port || "5432");
const database = url.pathname.substring(1); // Remove leading /
const user = url.username;
const password = url.password;
const ssl = true;

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host,
    port,
    database,
    user,
    password,
    ssl,
  },
} satisfies Config;
