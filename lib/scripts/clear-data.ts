import { db } from "../db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function clearDatabase() {
  try {
    console.log("🧹 Starting database cleanup...");

    // Clear all existing data
    await db.execute(sql`TRUNCATE TABLE 
      babysitting.bookings, 
      babysitting.booking_requests, 
      babysitting.availability, 
      babysitting.babysitters, 
      babysitting.parents CASCADE`);

    console.log("✅ All data has been removed from the database");
    console.log("📊 Database is now empty");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database clearing failed:", error);
    process.exit(1);
  }
}

clearDatabase();
