"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateRequestStatus, createBooking } from "@/app/actions";
import AvailableBabysitters from "@/app/components/AvailableBabysitters";

type RequestStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface RequestDetailClientWrapperProps {
  requestId: number;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function RequestDetailClientWrapper({
  requestId,
  date,
  startTime,
  endTime,
}: RequestDetailClientWrapperProps) {
  const router = useRouter();
  const [selectedBabysitterId, setSelectedBabysitterId] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    setIsLoading(true);
    try {
      // If confirming and a babysitter is selected, create the booking
      if (newStatus === "confirmed" && selectedBabysitterId) {
        const bookingResult = await createBooking({
          requestId,
          babysitterId: selectedBabysitterId,
        });

        if (bookingResult.success) {
          toast.success("Booking confirmed successfully");
          router.refresh();
        } else {
          toast.error(bookingResult.error || "Failed to create booking");
        }
      } else {
        // Otherwise just update the status
        const result = await updateRequestStatus({
          requestId,
          status: newStatus,
        });

        if (result.success) {
          toast.success(`Request ${newStatus} successfully`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update status");
        }
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  };

  const isInPast = () => {
    const requestEndTime = formatDateTime(date, endTime);
    return requestEndTime < new Date();
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Assign Babysitter</h2>
        <div className="bg-gray-50 p-4 rounded">
          <AvailableBabysitters
            date={date}
            startTime={startTime}
            endTime={endTime}
            onSelect={(id) => setSelectedBabysitterId(id)}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={() => handleStatusUpdate("confirmed")}
          disabled={isLoading || isInPast() || !selectedBabysitterId}
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          Confirm
        </Button>
        <Button
          onClick={() => handleStatusUpdate("cancelled")}
          disabled={isLoading}
          variant="destructive"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
