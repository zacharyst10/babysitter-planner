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
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";

export default function AvailabilityPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock availability data - to be replaced with actual data from backend later
  const availableDates = [
    {
      date: new Date(2024, 2, 22), // March 22, 2024
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
    },
    {
      date: new Date(2024, 2, 23), // March 23, 2024
      slots: [{ start: "18:00", end: "22:00" }],
    },
    {
      date: new Date(2024, 2, 28), // March 28, 2024
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
        { start: "18:00", end: "22:00" },
      ],
    },
  ];

  const unavailableDates = [
    new Date(2024, 2, 24), // March 24, 2024
    new Date(2024, 2, 25), // March 25, 2024
  ];

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (d) => d.date.toDateString() === date.toDateString()
    );
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const getAvailableTimeSlots = (date: Date | undefined) => {
    if (!date) return [];

    const availableDate = availableDates.find(
      (d) => d.date.toDateString() === date.toDateString()
    );

    return availableDate ? availableDate.slots : [];
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
          Grandparents Availability
        </h1>
        <p className="text-muted-foreground">
          See when Grandma and Grandpa are available for babysitting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Babysitting Calendar</CardTitle>
            <CardDescription>
              Green dates show when Grandma and Grandpa are available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  available: (date) => isDateAvailable(date),
                  unavailable: (date) => isDateUnavailable(date),
                }}
                modifiersStyles={{
                  available: { backgroundColor: "#dcfce7", color: "#166534" },
                  unavailable: { backgroundColor: "#fee2e2", color: "#991b1b" },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Times</CardTitle>
            <CardDescription>
              {date ? date.toDateString() : "Select a date"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDateUnavailable(date as Date) ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Grandma and Grandpa are not available on this date.
                </p>
              </div>
            ) : isDateAvailable(date as Date) ? (
              <div className="space-y-4">
                <div className="rounded-md border p-3">
                  <p className="font-medium mb-2">Available Time Slots:</p>
                  {getAvailableTimeSlots(date).map((slot, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1 border-b last:border-0"
                    >
                      <span className="text-sm">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full">
                  <Link href="/request">Request Babysitting</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  No availability information for this date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Available Dates</CardTitle>
          <CardDescription>
            All dates when Grandma and Grandpa can babysit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableDates.map((dateItem, index) => (
              <div key={index} className="border rounded-md p-3">
                <p className="font-medium mb-1">
                  {dateItem.date.toDateString()}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {dateItem.slots.length} time slot
                  {dateItem.slots.length !== 1 ? "s" : ""}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setDate(dateItem.date)}
                >
                  View Times
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
