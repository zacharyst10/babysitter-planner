# Backend Integration Guide

This application uses a Neon PostgreSQL database with Drizzle ORM for database operations and Resend for email notifications.

## Setup

1. Create a Neon PostgreSQL database at [https://neon.tech](https://neon.tech)
2. Sign up for a Resend account at [https://resend.com](https://resend.com)
3. Copy the PostgreSQL connection string from Neon
4. Get your API key from Resend
5. Update the `.env` file with your credentials:

```
DATABASE_URL="postgresql://user:password@host:port/database"
RESEND_API_KEY="your_resend_api_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # For development
```

## Database Setup

After configuring your environment variables, run the following commands:

```bash
# Generate migrations from your schema
pnpm db:generate

# Apply migrations to your database
pnpm db:migrate

# (Optional) Open Drizzle Studio to view and manage your data
pnpm db:studio
```

## Database Schema

The database schema consists of:

- **Parents**: Users who book babysitting services
- **Babysitters**: Users who provide babysitting services
- **Availability**: Defines when babysitters are available
- **Booking Requests**: Requests made by parents
- **Bookings**: Confirmed appointments

## API Endpoints

### Bookings

- `GET /api/bookings` - List all bookings with optional filtering
- `GET /api/bookings/:id` - Get a single booking
- `POST /api/bookings` - Create a new booking
- `PATCH /api/bookings/:id` - Update a booking
- `POST /api/bookings/:id/cancel` - Cancel a booking

### Booking Requests

- `GET /api/requests` - List all booking requests
- `POST /api/requests` - Create a new booking request

### Availability

- `GET /api/availability` - Get available time slots
- `POST /api/availability` - Add new availability for a babysitter

## Email Notifications

The application uses Resend with React Email for sending notifications:

- Booking confirmations to both parents and babysitters
- Booking request notifications to babysitters
- Cancellation notifications

## Frontend Integration

The frontend includes a service layer (`lib/api.ts`) for making API requests, which abstracts the complexity of interacting with the backend.

Example usage:

```typescript
import { bookingsApi } from "@/lib/api";

// Get all bookings for a parent
const bookings = await bookingsApi.getAll({ parentId: 1 });

// Create a new booking
await bookingsApi.create({
  parentId: 1,
  babysitterId: 2,
  requestId: 3,
  date: "2023-05-15",
  startTime: "14:00",
  endTime: "18:00",
  notes: "Please arrive 10 minutes early",
});
```
