import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Neon client
const sql = neon(process.env.DATABASE_URL!);

// Create and export Drizzle ORM instance
export const db = drizzle(sql, { schema });
