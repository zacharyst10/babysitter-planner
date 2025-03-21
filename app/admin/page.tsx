import { getAvailability, getAllBookingRequests } from "@/app/actions";
import { AdminClient } from "@/app/admin/admin-client";

export default async function AdminPage() {
  // Fetch availability data
  const availability = await getAvailability();

  // Fetch pending booking requests
  const pendingRequests = await getAllBookingRequests("pending");

  // Fetch confirmed booking requests
  const confirmedRequests = await getAllBookingRequests("confirmed");

  // Map the availability data to match the expected type
  const formattedAvailability =
    availability.success && availability.data
      ? availability.data.map((slot) => ({
          id: slot.id,
          babysitterId: slot.babysitterId,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          recurring: slot.recurring ?? false, // Convert null to false
        }))
      : [];

  return (
    <main className="container max-w-screen-lg py-8">
      <AdminClient
        initialAvailability={formattedAvailability}
        pendingRequests={
          pendingRequests.success ? pendingRequests.data || [] : []
        }
        confirmedRequests={
          confirmedRequests.success ? confirmedRequests.data || [] : []
        }
      />
    </main>
  );
}
