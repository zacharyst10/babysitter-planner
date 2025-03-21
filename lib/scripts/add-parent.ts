import { db } from "../db";
import { parents } from "../db/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function addParent() {
  try {
    console.log("🧑‍👩‍👧 Adding a parent record to the database...");

    // Add a parent record
    const parentData = await db
      .insert(parents)
      .values({
        name: "Test User",
        email: "test@example.com",
        phone: "555-123-4567",
      })
      .returning();

    console.log(`✅ Added parent with ID: ${parentData[0].id}`);
    console.log("Name:", parentData[0].name);
    console.log("Email:", parentData[0].email);
    console.log("Phone:", parentData[0].phone);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding parent:", error);
    process.exit(1);
  }
}

addParent();
