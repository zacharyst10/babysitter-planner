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
import { format } from "date-fns";

interface AvailabilityDisplayProps {
  initialAvailableDates: Record<
    string,
    { date: Date; slots: { id: number; start: string; end: string }[] }
  >;
}

export function AvailabilityDisplay({
  initialAvailableDates,
}: AvailabilityDisplayProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availableDates] = useState(initialAvailableDates);

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dateStr in availableDates;
  };

  const getAvailableTimeSlots = (date: Date | undefined) => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return availableDates[dateStr]?.slots || [];
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Babysitting Calendar</CardTitle>
          <CardDescription>
            Green dates show when babysitters are available
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
              }}
              modifiersStyles={{
                available: { backgroundColor: "#dcfce7", color: "#166534" },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
          <CardDescription>
            {date
              ? `Available times on ${format(date, "MMMM d, yyyy")}`
              : "Select a date to see available times"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {getAvailableTimeSlots(date).length > 0 ? (
              <div className="space-y-2">
                {getAvailableTimeSlots(date).map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link
                        href={`/request?date=${format(
                          date!,
                          "yyyy-MM-dd"
                        )}&startTime=${slot.start}&endTime=${slot.end}`}
                      >
                        Book
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : date ? (
              <p>No available times on this date.</p>
            ) : (
              <p>Please select a date to see available times.</p>
            )}

            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/request">Request Custom Time</Link>
              </Button>
            </div>
          </>
        </CardContent>
      </Card>
    </div>
  );
}
