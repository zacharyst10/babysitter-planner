import { db } from "../db";
import {
  parents,
  babysitters,
  availability,
  bookingRequests,
  bookings,
} from "../db/schema";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if babysitting schema exists, create if not
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS babysitting`);

    // First, clear any existing data (for clean seeding)
    console.log("🧹 Clearing existing data...");
    await db.execute(sql`TRUNCATE TABLE 
      babysitting.bookings, 
      babysitting.booking_requests, 
      babysitting.availability, 
      babysitting.babysitters, 
      babysitting.parents CASCADE`);

    // Seed parents
    console.log("👪 Adding parents...");
    const parentData = await db
      .insert(parents)
      .values([
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          phone: "555-123-4567",
        },
        {
          name: "Michael and Emily Chen",
          email: "chen.family@example.com",
          phone: "555-234-5678",
        },
        {
          name: "David Williams",
          email: "david.w@example.com",
          phone: "555-345-6789",
        },
        {
          name: "Jessica Rodriguez",
          email: "jrodriguez@example.com",
          phone: "555-456-7890",
        },
        {
          name: "Robert and Lisa Thompson",
          email: "thompson.family@example.com",
          phone: "555-567-8901",
        },
      ])
      .returning();

    console.log(`✅ Added ${parentData.length} parents`);

    // Seed babysitters
    console.log("👧 Adding babysitters...");
    const babysitterData = await db
      .insert(babysitters)
      .values([
        {
          name: "Emma Wilson",
          email: "emma.wilson@example.com",
          phone: "555-987-6543",
          bio: "Experienced babysitter with 5+ years of childcare. CPR certified and early childhood education student.",
        },
        {
          name: "Noah Garcia",
          email: "noah.g@example.com",
          phone: "555-876-5432",
          bio: "Elementary education major with a love for creative play and educational activities.",
        },
        {
          name: "Olivia Martinez",
          email: "olivia.m@example.com",
          phone: "555-765-4321",
          bio: "Certified in first aid and CPR. Experienced with infants, toddlers, and school-age children.",
        },
        {
          name: "Ethan Davis",
          email: "ethan.davis@example.com",
          phone: "555-654-3210",
          bio: "Physical education major who loves sports and outdoor activities with kids.",
        },
        {
          name: "Sophia Kim",
          email: "sophia.k@example.com",
          phone: "555-543-2109",
          bio: "Child psychology student with experience working with children with special needs.",
        },
      ])
      .returning();

    console.log(`✅ Added ${babysitterData.length} babysitters`);

    // Seed availability (next 2 weeks)
    console.log("📅 Adding availability...");

    // Create dates for the next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    });

    // Generate availability entries with different time slots
    const availabilityEntries = [];

    for (const babysitter of babysitterData) {
      // Each babysitter has different availability patterns
      const daysAvailable = Math.floor(Math.random() * 7) + 5; // 5-12 days available

      // Select random days from the next 14 days
      const availableDays = dates
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, daysAvailable);

      for (const day of availableDays) {
        // Morning shift (8am-12pm)
        if (Math.random() > 0.3) {
          availabilityEntries.push({
            babysitterId: babysitter.id,
            date: day,
            startTime: "08:00:00",
            endTime: "12:00:00",
            recurring: Math.random() > 0.7, // 30% chance of being recurring
          });
        }

        // Afternoon shift (12pm-5pm)
        if (Math.random() > 0.4) {
          availabilityEntries.push({
            babysitterId: babysitter.id,
            date: day,
            startTime: "12:00:00",
            endTime: "17:00:00",
            recurring: Math.random() > 0.7,
          });
        }

        // Evening shift (5pm-10pm)
        if (Math.random() > 0.3) {
          availabilityEntries.push({
            babysitterId: babysitter.id,
            date: day,
            startTime: "17:00:00",
            endTime: "22:00:00",
            recurring: Math.random() > 0.7,
          });
        }
      }
    }

    // Insert availability in batches to avoid too many values error
    const batchSize = 50;
    for (let i = 0; i < availabilityEntries.length; i += batchSize) {
      const batch = availabilityEntries.slice(i, i + batchSize);
      await db.insert(availability).values(batch);
    }

    console.log(`✅ Added ${availabilityEntries.length} availability slots`);

    // Seed booking requests
    console.log("📝 Adding booking requests...");

    const statuses = ["pending", "confirmed", "cancelled", "completed"];
    const requestEntries = [];

    // Generate 15 booking requests
    for (let i = 0; i < 15; i++) {
      const randomParent =
        parentData[Math.floor(Math.random() * parentData.length)];
      const randomDate = dates[Math.floor(Math.random() * dates.length)];

      // Pick a random start time between 8am and 7pm
      const hour = Math.floor(Math.random() * 11) + 8; // 8am to 7pm
      const startTime = `${hour.toString().padStart(2, "0")}:00:00`;

      // Duration between 2 and 5 hours
      const duration = Math.floor(Math.random() * 4) + 2;
      const endHour = Math.min(hour + duration, 23);
      const endTime = `${endHour.toString().padStart(2, "0")}:00:00`;

      // Random request status, weighted toward pending and confirmed
      const statusWeights = [0.4, 0.4, 0.1, 0.1]; // pending, confirmed, cancelled, completed
      const randomStatus =
        statuses[
          statusWeights
            .map((weight, index) => ({ weight, index }))
            .sort(() => Math.random() - 0.5)
            .reduce((prev, curr) => (prev.weight > curr.weight ? prev : curr))
            .index
        ];

      requestEntries.push({
        parentId: randomParent.id,
        date: randomDate,
        startTime,
        endTime,
        notes: Math.random() > 0.3 ? getRandomRequestNote() : null,
        status: randomStatus,
      });
    }

    const requestData = await db
      .insert(bookingRequests)
      .values(requestEntries)
      .returning();

    console.log(`✅ Added ${requestData.length} booking requests`);

    // Seed confirmed bookings (based on confirmed requests)
    console.log("📚 Adding confirmed bookings...");

    const confirmedRequests = requestData.filter(
      (req) => req.status === "confirmed"
    );
    const bookingEntries = [];

    for (const request of confirmedRequests) {
      // Assign a random babysitter
      const randomBabysitter =
        babysitterData[Math.floor(Math.random() * babysitterData.length)];

      bookingEntries.push({
        parentId: request.parentId,
        babysitterId: randomBabysitter.id,
        requestId: request.id,
        date: request.date,
        startTime: request.startTime,
        endTime: request.endTime,
        notes: request.notes,
        status: "confirmed",
      });
    }

    // Add one completed booking
    if (requestData.length > 0) {
      const pastRequest = requestData[0];
      const randomBabysitter =
        babysitterData[Math.floor(Math.random() * babysitterData.length)];

      // A booking from yesterday that's completed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      bookingEntries.push({
        parentId: pastRequest.parentId,
        babysitterId: randomBabysitter.id,
        requestId: pastRequest.id,
        date: yesterdayString,
        startTime: "18:00:00",
        endTime: "21:00:00",
        notes: "Children were well-behaved. Left a pizza in the fridge.",
        status: "completed",
      });
    }

    const bookingData = await db
      .insert(bookings)
      .values(bookingEntries)
      .returning();

    console.log(`✅ Added ${bookingData.length} confirmed bookings`);
    console.log("✅ Database seeded successfully!");

    // Print summary
    console.log("\n📊 Database Summary:");
    console.log(`- Parents: ${parentData.length}`);
    console.log(`- Babysitters: ${babysitterData.length}`);
    console.log(`- Availability Slots: ${availabilityEntries.length}`);
    console.log(`- Booking Requests: ${requestData.length}`);
    console.log(`- Confirmed Bookings: ${bookingData.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

function getRandomRequestNote() {
  const notes = [
    "Please bring some books to read.",
    "My child has a mild peanut allergy.",
    "We'll be back around 10pm but will text if running late.",
    "The kids need to finish homework before any screen time.",
    "Please take the dog for a quick walk if possible.",
    "Kids should be in bed by 8:30pm.",
    "Emergency contacts are on the fridge.",
    "Feel free to order pizza for dinner.",
    "Our youngest might need help with bath time.",
    "Please limit screen time to 1 hour max.",
  ];

  return notes[Math.floor(Math.random() * notes.length)];
}

seedDatabase();
