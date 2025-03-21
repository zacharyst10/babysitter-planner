import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Run a simple query to test connection
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    // Check if babysitting schema exists
    const schemaResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'babysitting'
      ) as schema_exists
    `);

    // Get table count in babysitting schema
    const tableCountResult = await db.execute(sql`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'babysitting'
    `);

    return NextResponse.json({
      status: "Connected",
      timestamp: result.rows[0].current_time,
      schema: {
        exists: schemaResult.rows[0].schema_exists,
        tableCount: tableCountResult.rows[0].table_count,
      },
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "Error",
        message: "Failed to connect to database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
