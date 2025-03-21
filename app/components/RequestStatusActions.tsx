"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateRequestStatus, createBooking } from "@/app/actions";

interface RequestStatusActionsProps {
  requestId: number;
  status: string;
  hasBabysitter?: boolean;
  babysitterId?: number;
}

export default function RequestStatusActions({
  requestId,
  status,
  hasBabysitter,
  babysitterId,
}: RequestStatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
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
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!babysitterId) {
      toast.error("No babysitter selected");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createBooking({
        requestId,
        babysitterId,
      });

      if (result.success) {
        toast.success("Booking confirmed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create booking");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show actions for completed or cancelled requests
  if (status === "completed" || status === "cancelled") {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {status === "pending" && (
          <>
            <Button
              onClick={() => updateStatus("cancelled")}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              Cancel
            </Button>

            {hasBabysitter && babysitterId && (
              <Button
                onClick={confirmBooking}
                disabled={isLoading}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Booking
              </Button>
            )}
          </>
        )}

        {status === "confirmed" && (
          <Button
            onClick={() => updateStatus("completed")}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Mark as Completed
          </Button>
        )}
      </div>
    </div>
  );
}
