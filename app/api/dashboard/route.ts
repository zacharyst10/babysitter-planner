import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  parents,
  babysitters,
  availability,
  bookingRequests,
  bookings,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get counts for each table
    const counts = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM babysitting.parents) as parents_count,
        (SELECT COUNT(*) FROM babysitting.babysitters) as babysitters_count,
        (SELECT COUNT(*) FROM babysitting.availability) as availability_count,
        (SELECT COUNT(*) FROM babysitting.booking_requests) as requests_count,
        (SELECT COUNT(*) FROM babysitting.bookings) as bookings_count
    `);

    // Get all parents
    const allParents = await db.select().from(parents);

    // Get all babysitters
    const allBabysitters = await db.select().from(babysitters);

    // Get booking requests with parent information
    const allRequests = await db
      .select({
        id: bookingRequests.id,
        date: bookingRequests.date,
        startTime: bookingRequests.startTime,
        endTime: bookingRequests.endTime,
        status: bookingRequests.status,
        notes: bookingRequests.notes,
        createdAt: bookingRequests.createdAt,
        parent: {
          id: parents.id,
          name: parents.name,
          email: parents.email,
          phone: parents.phone,
        },
      })
      .from(bookingRequests)
      .leftJoin(parents, sql`${bookingRequests.parentId} = ${parents.id}`)
      .orderBy(bookingRequests.date);

    // Get confirmed bookings with parent and babysitter information
    const allBookings = await db
      .select({
        id: bookings.id,
        date: bookings.date,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        parent: {
          id: parents.id,
          name: parents.name,
        },
        babysitter: {
          id: babysitters.id,
          name: babysitters.name,
        },
      })
      .from(bookings)
      .leftJoin(parents, sql`${bookings.parentId} = ${parents.id}`)
      .leftJoin(babysitters, sql`${bookings.babysitterId} = ${babysitters.id}`)
      .orderBy(bookings.date);

    // Get upcoming availability by babysitter
    const today = new Date().toISOString().split("T")[0];
    const upcomingAvailability = await db
      .select({
        id: availability.id,
        date: availability.date,
        startTime: availability.startTime,
        endTime: availability.endTime,
        recurring: availability.recurring,
        babysitter: {
          id: babysitters.id,
          name: babysitters.name,
        },
      })
      .from(availability)
      .leftJoin(
        babysitters,
        sql`${availability.babysitterId} = ${babysitters.id}`
      )
      .where(sql`${availability.date} >= ${today}`)
      .orderBy(availability.date);

    // Group availability by babysitter
    const availabilityByBabysitter = upcomingAvailability.reduce(
      (acc, curr) => {
        const { babysitter, ...availabilityData } = curr;

        if (!acc[babysitter.id]) {
          acc[babysitter.id] = {
            babysitter,
            slots: [],
          };
        }

        acc[babysitter.id].slots.push(availabilityData);
        return acc;
      },
      {} as Record<number, { babysitter: any; slots: any[] }>
    );

    return NextResponse.json({
      summary: counts.rows[0],
      data: {
        parents: allParents,
        babysitters: allBabysitters,
        bookingRequests: allRequests,
        bookings: allBookings,
        availability: Object.values(availabilityByBabysitter),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
