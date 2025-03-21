import { db } from "../db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log("🔄 Testing database connection...");
    console.log(
      `Database URL: ${process.env.DATABASE_URL?.substring(0, 20)}...`
    );

    // Run a simple query
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    console.log("✅ Database connection successful!");
    console.log(`Current server time: ${result.rows[0].current_time}`);

    // Check if babysitting schema exists or create it
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS babysitting`);
    console.log("✅ Babysitting schema ready");

    console.log(`\nConnection details:`);
    console.log(`- Server: Neon PostgreSQL`);
    console.log(
      `- Database: ${new URL(process.env.DATABASE_URL || "").pathname.substring(1)}`
    );
    console.log(`- Schema: babysitting`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);

    console.log("\nTroubleshooting tips:");
    console.log("1. Check if your DATABASE_URL is correct");
    console.log("2. Ensure your IP is allowed in Neon's connection settings");
    console.log("3. Verify that your Neon project is running");

    process.exit(1);
  }
}

testConnection();
