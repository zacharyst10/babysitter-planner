import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availability, babysitters } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Schema for creating availability
const availabilitySchema = z.object({
  babysitterId: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/), // HH:MM or HH:MM:SS
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  recurring: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date");
    const babysitterId = searchParams.get("babysitterId");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const whereConditions = [eq(availability.date, date)];

    if (babysitterId) {
      whereConditions.push(
        eq(availability.babysitterId, parseInt(babysitterId))
      );
    }

    const availabilitySlots = await db
      .select({
        id: availability.id,
        babysitterId: availability.babysitterId,
        date: availability.date,
        startTime: availability.startTime,
        endTime: availability.endTime,
        recurring: availability.recurring,
        babysitterName: babysitters.name,
      })
      .from(availability)
      .leftJoin(babysitters, eq(availability.babysitterId, babysitters.id))
      .where(and(...whereConditions));

    return NextResponse.json(availabilitySlots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = availabilitySchema.parse(body);

    // Check if babysitter exists
    const babysitter = await db
      .select()
      .from(babysitters)
      .where(eq(babysitters.id, validatedData.babysitterId))
      .limit(1);

    if (babysitter.length === 0) {
      return NextResponse.json(
        { error: "Babysitter not found" },
        { status: 404 }
      );
    }

    // Create availability
    const [newAvailability] = await db
      .insert(availability)
      .values({
        babysitterId: validatedData.babysitterId,
        date: validatedData.date,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        recurring: validatedData.recurring,
      })
      .returning();

    return NextResponse.json(newAvailability, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error creating availability:", error);
    return NextResponse.json(
      { error: "Failed to create availability" },
      { status: 500 }
    );
  }
}
