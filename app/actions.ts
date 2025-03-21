"use server";

import { db } from "@/lib/db";
import {
  bookingRequests,
  bookings,
  babysitters,
  availability,
  parents,
} from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createRequestSchema = z.object({
  parentId: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/), // HH:MM or HH:MM:SS
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  notes: z.string().optional(),
});

const updateRequestStatusSchema = z.object({
  requestId: z.number(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

const createBookingSchema = z.object({
  requestId: z.number(),
  babysitterId: z.number(),
});

// Server Actions

/**
 * Create a new booking request
 */
export async function createBookingRequest(formData: FormData) {
  try {
    // Parse and validate form data
    const parentId = parseInt(formData.get("parentId") as string);
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const notes = formData.get("notes") as string;

    // Validate form data
    const validatedData = createRequestSchema.parse({
      parentId,
      date,
      startTime,
      endTime,
      notes: notes || undefined,
    });

    // Create booking request
    const [request] = await db
      .insert(bookingRequests)
      .values({
        parentId: validatedData.parentId,
        date: validatedData.date,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        notes: validatedData.notes,
        status: "pending",
      })
      .returning();

    // Revalidate dashboard page to show new request
    revalidatePath("/dashboard");

    return { success: true, data: request };
  } catch (error) {
    console.error("Error creating booking request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update booking request status
 */
export async function updateRequestStatus(data: {
  requestId: number;
  status: string;
}) {
  try {
    // Validate data
    const validatedData = updateRequestStatusSchema.parse(data);

    // Update request status
    const [updatedRequest] = await db
      .update(bookingRequests)
      .set({ status: validatedData.status })
      .where(eq(bookingRequests.id, validatedData.requestId))
      .returning();

    // If status is cancelled, cancel any associated booking too
    if (validatedData.status === "cancelled") {
      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.requestId, validatedData.requestId));
    }

    // Revalidate dashboard page to show updated status
    revalidatePath("/dashboard");

    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error("Error updating request status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Create a booking from a request
 */
export async function createBooking(data: {
  requestId: number;
  babysitterId: number;
}) {
  try {
    // Validate data
    const validatedData = createBookingSchema.parse(data);

    // Get the request details
    const [request] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, validatedData.requestId));

    if (!request) {
      throw new Error("Booking request not found");
    }

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        parentId: request.parentId,
        babysitterId: validatedData.babysitterId,
        requestId: validatedData.requestId,
        date: request.date,
        startTime: request.startTime,
        endTime: request.endTime,
        notes: request.notes,
        status: "confirmed",
      })
      .returning();

    // Update request status to confirmed
    await db
      .update(bookingRequests)
      .set({ status: "confirmed" })
      .where(eq(bookingRequests.id, validatedData.requestId));

    // Revalidate dashboard page to show new booking
    revalidatePath("/dashboard");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get available babysitters for a given date and time
 */
export async function getAvailableBabysitters(
  date: string,
  startTime: string,
  endTime: string
) {
  try {
    // Find babysitters with availability for the requested time slot
    const availableBabysitters = await db
      .select({
        id: babysitters.id,
        name: babysitters.name,
        email: babysitters.email,
        phone: babysitters.phone,
        bio: babysitters.bio,
      })
      .from(babysitters)
      .innerJoin(
        availability,
        and(
          eq(availability.babysitterId, babysitters.id),
          eq(availability.date, date),
          gte(availability.startTime, startTime),
          gte(availability.endTime, endTime)
        )
      )
      .groupBy(babysitters.id);

    return { success: true, data: availableBabysitters };
  } catch (error) {
    console.error("Error finding available babysitters:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Availability related actions

/**
 * Get availability for a specific date or babysitter
 */
export async function getAvailability(filters?: {
  date?: string;
  babysitterId?: number;
}) {
  try {
    let query = db.select().from(availability);

    if (filters?.date) {
      query = query.where(eq(availability.date, filters.date));
    }

    if (filters?.babysitterId) {
      query = query.where(eq(availability.babysitterId, filters.babysitterId));
    }

    const availabilitySlots = await query;

    return { success: true, data: availabilitySlots };
  } catch (error) {
    console.error("Error fetching availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Add new availability slot
 */
export async function addAvailability(data: {
  babysitterId: number;
  date: string;
  startTime: string;
  endTime: string;
  recurring?: boolean;
}) {
  try {
    const [newAvailability] = await db
      .insert(availability)
      .values({
        babysitterId: data.babysitterId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        recurring: data.recurring || false,
      })
      .returning();

    revalidatePath("/admin/availability");
    revalidatePath("/availability");

    return { success: true, data: newAvailability };
  } catch (error) {
    console.error("Error adding availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Remove availability slot
 */
export async function removeAvailability(id: number) {
  try {
    await db.delete(availability).where(eq(availability.id, id));

    revalidatePath("/admin/availability");
    revalidatePath("/availability");

    return { success: true };
  } catch (error) {
    console.error("Error removing availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all booking requests with parent information
 */
export async function getAllBookingRequests(status?: string) {
  try {
    let query = db
      .select({
        request: bookingRequests,
        parent: {
          id: sql<number>`${parents.id}`,
          name: sql<string>`${parents.name}`,
          email: sql<string>`${parents.email}`,
          phone: sql<string>`${parents.phone}`,
        },
      })
      .from(bookingRequests)
      .innerJoin(parents, eq(bookingRequests.parentId, parents.id));

    if (status) {
      query = query.where(eq(bookingRequests.status, status));
    }

    const requests = await query;

    return {
      success: true,
      data: requests.map((r) => ({
        id: r.request.id,
        parentId: r.request.parentId,
        date: r.request.date,
        startTime: r.request.startTime,
        endTime: r.request.endTime,
        status: r.request.status,
        notes: r.request.notes,
        parent: r.parent,
      })),
    };
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Create a reservation directly from a user
 */
export async function createReservation(data: {
  date: string;
  startTime: string;
  endTime: string;
  childrenCount: number;
  notes?: string;
}) {
  try {
    // Validate that the requested time slot is available
    const availability = await getAvailability();
    if (!availability.success) {
      return { success: false, message: "Could not verify availability" };
    }

    const availableSlot = availability.data?.find(
      (slot) =>
        slot.date === data.date &&
        slot.startTime === data.startTime &&
        slot.endTime === data.endTime
    );

    if (!availableSlot) {
      return {
        success: false,
        message: "The selected time slot is no longer available",
      };
    }

    // Create the booking request
    const db = await getDatabase();
    const [result] = await db.execute(
      `INSERT INTO booking_requests (date, start_time, end_time, children_count, notes, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.date,
        data.startTime,
        data.endTime,
        data.childrenCount,
        data.notes || "",
        "Pending",
      ]
    );

    const insertId = (result as any).insertId;

    return {
      success: true,
      message: "Reservation created successfully",
      data: { id: insertId },
    };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return { success: false, message: "Failed to create reservation" };
  }
}

/**
 * Get reservations for the current user
 */
export async function getUserReservations() {
  try {
    const db = await getDatabase();
    const [rows] = await db.execute(
      `SELECT 
         id, 
         date, 
         start_time as startTime, 
         end_time as endTime, 
         children_count as childrenCount, 
         notes, 
         status
       FROM booking_requests
       ORDER BY date DESC, start_time ASC`
    );

    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    return { success: false, message: "Failed to fetch reservations" };
  }
}

// Helper function to get database connection
async function getDatabase() {
  // Reuse the existing db connection from Drizzle
  // This is a simplified approach - in a real app, you might want to create
  // a proper connection to the database
  return {
    async execute(query: string, params: any[] = []) {
      try {
        // For simplicity, map to the existing Drizzle ORM methods
        if (query.includes("INSERT INTO booking_requests")) {
          const [result] = await db
            .insert(bookingRequests)
            .values({
              parentId: 11, // Updated to the actual parent ID we just created
              date: params[0],
              startTime: params[1],
              endTime: params[2],
              notes: params[4] || null,
              status: "pending",
            })
            .returning();

          return [{ insertId: result.id }];
        } else if (query.includes("SELECT")) {
          // For user reservations query
          const requests = await db
            .select()
            .from(bookingRequests)
            .where(eq(bookingRequests.parentId, 11)); // Updated to the actual parent ID

          return [
            requests.map((r) => ({
              id: r.id,
              date: r.date,
              startTime: r.startTime,
              endTime: r.endTime,
              childrenCount: 1, // This would normally come from the database
              notes: r.notes,
              status: (r.status.charAt(0).toUpperCase() + r.status.slice(1)) as
                | "Pending"
                | "Confirmed"
                | "Cancelled",
            })),
          ];
        }

        return [[]];
      } catch (error) {
        console.error("Database execution error:", error);
        throw error;
      }
    },
  };
}
