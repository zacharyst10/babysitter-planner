import { getAvailability, getUserReservations } from "@/app/actions";
import { UserClient } from "@/app/user-client";

type AvailableSlot = {
  id: number;
  start: string;
  end: string;
};

export default async function HomePage() {
  // Fetch availability data
  const availability = await getAvailability();

  // Transform availability data for the client component
  const availableDates: Record<string, { date: Date; slots: AvailableSlot[] }> =
    {};

  if (availability.success && availability.data) {
    availability.data.forEach((slot) => {
      const dateStr = slot.date;
      if (!availableDates[dateStr]) {
        availableDates[dateStr] = {
          date: new Date(dateStr),
          slots: [],
        };
      }

      availableDates[dateStr].slots.push({
        id: slot.id,
        start: slot.startTime,
        end: slot.endTime,
      });
    });
  }

  // Fetch user reservations
  const reservations = await getUserReservations();

  return (
    <main className="container max-w-screen-lg py-8">
      <UserClient
        initialAvailableDates={availableDates}
        initialReservations={
          reservations.success ? reservations.data || [] : []
        }
      />
    </main>
  );
}
