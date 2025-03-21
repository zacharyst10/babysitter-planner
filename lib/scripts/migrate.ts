import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Migration function
async function main() {
  try {
    console.log("🔄 Starting database migration...");

    // Create postgres client with non-null assertion (we've checked above)
    const pgClient = postgres(connectionString!, { max: 1 });

    // Create Drizzle instance
    const db = drizzle(pgClient);

    // Note: We don't need to create the schema here since we're using the babysitting schema
    // in our table definitions directly, and we already created it in the test script

    // Run migrations
    console.log("🔄 Running migrations...");
    await migrate(db, { migrationsFolder: "drizzle" });

    console.log("✅ Database migration completed successfully");
    await pgClient.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
