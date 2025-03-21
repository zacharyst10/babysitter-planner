"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { updateRequestStatus } from "@/app/actions";

interface BookingRequest {
  id: number;
  parentId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  parent: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

interface AdminReservationsClientProps {
  initialPendingRequests: BookingRequest[];
  initialConfirmedRequests: BookingRequest[];
}

export function AdminReservationsClient({
  initialPendingRequests,
  initialConfirmedRequests,
}: AdminReservationsClientProps) {
  const [pendingReservations, setPendingReservations] = useState(
    initialPendingRequests
  );
  const [confirmedReservations, setConfirmedReservations] = useState(
    initialConfirmedRequests
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleApproveReservation = async (id: number) => {
    setIsLoading(true);
    try {
      // Update status to Confirmed
      const result = await updateRequestStatus({
        requestId: id,
        status: "confirmed",
      });

      if (result.success) {
        // Find the reservation
        const reservation = pendingReservations.find((r) => r.id === id);
        if (reservation) {
          // Update in UI
          const updatedReservation = { ...reservation, status: "confirmed" };
          setPendingReservations(
            pendingReservations.filter((r) => r.id !== id)
          );
          setConfirmedReservations([
            ...confirmedReservations,
            updatedReservation,
          ]);
          toast.success("Reservation approved");
        }
      } else {
        toast.error(result.error || "Failed to approve reservation");
      }
    } catch (error) {
      console.error("Error approving reservation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineReservation = async (id: number) => {
    setIsLoading(true);
    try {
      // Update status to Cancelled
      const result = await updateRequestStatus({
        requestId: id,
        status: "cancelled",
      });

      if (result.success) {
        // Update in UI
        setPendingReservations(pendingReservations.filter((r) => r.id !== id));
        toast.success("Reservation declined");
      } else {
        toast.error(result.error || "Failed to decline reservation");
      }
    } catch (error) {
      console.error("Error declining reservation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Babysitting Requests
        </h1>
        <p className="text-muted-foreground">
          Manage babysitting requests from family members
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingReservations.length > 0 ? (
            pendingReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{formatDate(reservation.date)}</CardTitle>
                      <CardDescription>
                        {formatTime(reservation.startTime)} -{" "}
                        {formatTime(reservation.endTime)}
                      </CardDescription>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2.5 py-0.5">
                      Pending
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                      <span className="text-muted-foreground">From:</span>
                      <span>{reservation.parent.name}</span>

                      <span className="text-muted-foreground">Phone:</span>
                      <span>{reservation.parent.phone}</span>

                      <span className="text-muted-foreground">Email:</span>
                      <span>{reservation.parent.email}</span>
                    </div>

                    {reservation.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Notes:</p>
                        <p className="text-sm mt-1 bg-muted p-2 rounded-md">
                          {reservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="flex items-center justify-end gap-2 p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleDeclineReservation(reservation.id)}
                    disabled={isLoading}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApproveReservation(reservation.id)}
                    disabled={isLoading}
                  >
                    Approve
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Requests</CardTitle>
                <CardDescription>
                  You don&apos;t have any babysitting requests to review at the
                  moment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  When family members request babysitting, their requests will
                  appear here for your approval.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedReservations.length > 0 ? (
            confirmedReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{formatDate(reservation.date)}</CardTitle>
                      <CardDescription>
                        {formatTime(reservation.startTime)} -{" "}
                        {formatTime(reservation.endTime)}
                      </CardDescription>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 rounded-full px-2.5 py-0.5">
                      Confirmed
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                      <span className="text-muted-foreground">From:</span>
                      <span>{reservation.parent.name}</span>

                      <span className="text-muted-foreground">Phone:</span>
                      <span>{reservation.parent.phone}</span>

                      <span className="text-muted-foreground">Email:</span>
                      <span>{reservation.parent.email}</span>
                    </div>

                    {reservation.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Notes:</p>
                        <p className="text-sm mt-1 bg-muted p-2 rounded-md">
                          {reservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Confirmed Bookings</CardTitle>
                <CardDescription>
                  You don&apos;t have any confirmed babysitting sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  After you approve requests, they will appear here as confirmed
                  bookings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
