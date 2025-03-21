-- CREATE SCHEMA "babysitting"; -- Schema already exists
--> statement-breakpoint
CREATE TABLE "babysitting"."availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"babysitter_id" serial NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"recurring" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "babysitting"."babysitters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "babysitters_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "babysitting"."booking_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" serial NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "babysitting"."bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" serial NOT NULL,
	"babysitter_id" serial NOT NULL,
	"request_id" serial NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"notes" text,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "babysitting"."parents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parents_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "babysitting"."availability" ADD CONSTRAINT "availability_babysitter_id_babysitters_id_fk" FOREIGN KEY ("babysitter_id") REFERENCES "babysitting"."babysitters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babysitting"."booking_requests" ADD CONSTRAINT "booking_requests_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "babysitting"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babysitting"."bookings" ADD CONSTRAINT "bookings_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "babysitting"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babysitting"."bookings" ADD CONSTRAINT "bookings_babysitter_id_babysitters_id_fk" FOREIGN KEY ("babysitter_id") REFERENCES "babysitting"."babysitters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babysitting"."bookings" ADD CONSTRAINT "bookings_request_id_booking_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "babysitting"."booking_requests"("id") ON DELETE no action ON UPDATE no action;