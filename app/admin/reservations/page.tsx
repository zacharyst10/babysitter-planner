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

export default function AdminReservationsPage() {
  // Mock pending reservations data - to be replaced with actual data from backend later
  const [pendingReservations, setPendingReservations] = useState([
    {
      id: 1,
      date: new Date(2024, 2, 27), // March 27, 2024
      startTime: "18:00",
      endTime: "21:00",
      childrenCount: 2,
      requesterName: "Emily & Jason",
      phoneNumber: "555-123-4567",
      notes: "The kids will have already had dinner.",
      status: "Pending",
    },
    {
      id: 2,
      date: new Date(2024, 3, 5), // April 5, 2024
      startTime: "17:30",
      endTime: "20:30",
      childrenCount: 1,
      requesterName: "Michael & Sarah",
      phoneNumber: "555-987-6543",
      notes: "Sammy has a slight allergy to peanuts, but it's not severe.",
      status: "Pending",
    },
  ]);

  // Mock confirmed reservations
  const [confirmedReservations, setConfirmedReservations] = useState([
    {
      id: 3,
      date: new Date(2024, 2, 25), // March 25, 2024
      startTime: "16:00",
      endTime: "19:00",
      childrenCount: 3,
      requesterName: "Emily & Jason",
      phoneNumber: "555-123-4567",
      notes: "We'll leave some snacks in the kitchen.",
      status: "Confirmed",
    },
  ]);

  const handleApproveReservation = (id: number) => {
    // Find the reservation
    const reservationIndex = pendingReservations.findIndex((r) => r.id === id);
    if (reservationIndex === -1) return;

    // Update status to Confirmed
    const reservation = {
      ...pendingReservations[reservationIndex],
      status: "Confirmed",
    };

    // Remove from pending and add to confirmed
    const newPending = pendingReservations.filter((r) => r.id !== id);
    setPendingReservations(newPending);
    setConfirmedReservations([...confirmedReservations, reservation]);

    toast.success("Reservation approved");
  };

  const handleDeclineReservation = (id: number) => {
    // Remove from pending
    setPendingReservations(pendingReservations.filter((r) => r.id !== id));
    toast.success("Reservation declined");
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
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
                      <CardTitle>{reservation.date.toDateString()}</CardTitle>
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
                      <span>{reservation.requesterName}</span>

                      <span className="text-muted-foreground">Phone:</span>
                      <span>{reservation.phoneNumber}</span>

                      <span className="text-muted-foreground">Children:</span>
                      <span>{reservation.childrenCount}</span>
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
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApproveReservation(reservation.id)}
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
                      <CardTitle>{reservation.date.toDateString()}</CardTitle>
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
                      <span>{reservation.requesterName}</span>

                      <span className="text-muted-foreground">Phone:</span>
                      <span>{reservation.phoneNumber}</span>

                      <span className="text-muted-foreground">Children:</span>
                      <span>{reservation.childrenCount}</span>
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
