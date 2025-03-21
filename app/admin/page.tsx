"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
  // Mock pending reservations data - to be replaced with actual data from backend later
  const pendingReservations = [
    {
      id: 1,
      date: new Date(2024, 2, 27), // March 27, 2024
      startTime: "18:00",
      endTime: "21:00",
      childrenCount: 2,
      requesterName: "Emily & Jason",
      status: "Pending",
    },
    {
      id: 2,
      date: new Date(2024, 3, 5), // April 5, 2024
      startTime: "17:30",
      endTime: "20:30",
      childrenCount: 1,
      requesterName: "Michael & Sarah",
      status: "Pending",
    },
  ];

  // Mock upcoming confirmed reservations
  const upcomingReservations = [
    {
      id: 3,
      date: new Date(2024, 2, 25), // March 25, 2024
      startTime: "16:00",
      endTime: "19:00",
      childrenCount: 3,
      requesterName: "Emily & Jason",
      status: "Confirmed",
    },
  ];

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
          Grandparents Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your babysitting schedule and availability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your babysitting schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start h-12">
              <Link href="/admin/availability">
                <span className="flex flex-col items-start">
                  <span>Set Availability</span>
                  <span className="text-xs text-muted-foreground">
                    Update when you&apos;re available
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12"
            >
              <Link href="/admin/reservations">
                <span className="flex flex-col items-start">
                  <span>View All Requests</span>
                  <span className="text-xs text-muted-foreground">
                    Review pending babysitting requests
                  </span>
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              Requests waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingReservations.length > 0 ? (
              <div className="space-y-3">
                {pendingReservations.map((reservation) => (
                  <div key={reservation.id} className="p-3 border rounded-md">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {reservation.date.toDateString()}
                      </p>
                      <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(reservation.startTime)} -{" "}
                      {formatTime(reservation.endTime)}
                    </p>
                    <p className="text-sm">From: {reservation.requesterName}</p>
                  </div>
                ))}
                <Button asChild size="sm" className="mt-2 w-full">
                  <Link href="/admin/reservations">Review All Requests</Link>
                </Button>
              </div>
            ) : (
              <p>No pending requests.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Confirmed Babysitting</CardTitle>
          <CardDescription>Your scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReservations.length > 0 ? (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      {reservation.date.toDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(reservation.startTime)} -{" "}
                      {formatTime(reservation.endTime)}
                    </p>
                    <p className="text-sm">For: {reservation.requesterName}</p>
                    <p className="text-sm">
                      Children: {reservation.childrenCount}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No upcoming babysitting sessions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
