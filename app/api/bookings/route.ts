import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendBookingConfirmationEmail } from "@/lib/email/booking";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const parentId = searchParams.get("parentId");
    const babysitterId = searchParams.get("babysitterId");

    const whereConditions = [];

    if (parentId) {
      whereConditions.push(eq(bookings.parentId, parseInt(parentId)));
    }

    if (babysitterId) {
      whereConditions.push(eq(bookings.babysitterId, parseInt(babysitterId)));
    }

    const result =
      whereConditions.length > 0
        ? await db
            .select()
            .from(bookings)
            .where(and(...whereConditions))
        : await db.select().from(bookings);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        parentId: body.parentId,
        babysitterId: body.babysitterId,
        requestId: body.requestId,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
        status: "confirmed",
      })
      .returning();

    // Update request status
    await db
      .update(bookingRequests)
      .set({ status: "confirmed" })
      .where(eq(bookingRequests.id, body.requestId));

    // Send confirmation email
    await sendBookingConfirmationEmail(booking);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
