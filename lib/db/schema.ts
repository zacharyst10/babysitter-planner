import {
  pgSchema,
  serial,
  text,
  timestamp,
  date,
  boolean,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define babysitting schema
export const babysitting = pgSchema("babysitting");

// Parents table
export const parents = babysitting.table("parents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Babysitters table
export const babysitters = babysitting.table("babysitters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Availability table
export const availability = babysitting.table("availability", {
  id: serial("id").primaryKey(),
  babysitterId: serial("babysitter_id").references(() => babysitters.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  recurring: boolean("recurring").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Booking requests
export const bookingRequests = babysitting.table("booking_requests", {
  id: serial("id").primaryKey(),
  parentId: serial("parent_id").references(() => parents.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  notes: text("notes"),
  status: text("status").default("pending").notNull(), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bookings (confirmed) table
export const bookings = babysitting.table("bookings", {
  id: serial("id").primaryKey(),
  parentId: serial("parent_id").references(() => parents.id),
  babysitterId: serial("babysitter_id").references(() => babysitters.id),
  requestId: serial("request_id").references(() => bookingRequests.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  notes: text("notes"),
  status: text("status").default("confirmed").notNull(), // confirmed, in-progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const parentsRelations = relations(parents, ({ many }) => ({
  bookingRequests: many(bookingRequests),
  bookings: many(bookings),
}));

export const babysittersRelations = relations(babysitters, ({ many }) => ({
  availability: many(availability),
  bookings: many(bookings),
}));

export const bookingRequestsRelations = relations(
  bookingRequests,
  ({ one }) => ({
    parent: one(parents, {
      fields: [bookingRequests.parentId],
      references: [parents.id],
    }),
  })
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  parent: one(parents, {
    fields: [bookings.parentId],
    references: [parents.id],
  }),
  babysitter: one(babysitters, {
    fields: [bookings.babysitterId],
    references: [babysitters.id],
  }),
  request: one(bookingRequests, {
    fields: [bookings.requestId],
    references: [bookingRequests.id],
  }),
}));
