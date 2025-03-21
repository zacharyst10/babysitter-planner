import { getAvailability } from "@/app/actions";
import { RequestPage } from "./request-client";

export default async function RequestPageWrapper() {
  // Fetch availability data
  const availability = await getAvailability();

  // Transform availability data for the client component
  const availableDates: Record<
    string,
    { date: Date; slots: { id: number; start: string; end: string }[] }
  > = {};

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

  return (
    <main className="container max-w-screen-lg py-8">
      <RequestPage initialAvailableDates={availableDates} />
    </main>
  );
}
