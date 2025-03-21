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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createReservation } from "@/app/actions";
import { formatTime } from "@/lib/utils";
import Link from "next/link";

type AvailableSlot = {
  id: number;
  start: string;
  end: string;
};

interface Reservation {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  childrenCount: number;
  status: "Pending" | "Confirmed" | "Cancelled";
}

interface UserClientProps {
  initialAvailableDates: Record<string, { date: Date; slots: AvailableSlot[] }>;
  initialReservations: Reservation[];
}

export function UserClient({
  initialAvailableDates,
  initialReservations,
}: UserClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [childrenCount, setChildrenCount] = useState("1");
  const [notes, setNotes] = useState("");
  const [availableDates] = useState(initialAvailableDates);
  const [reservations, setReservations] = useState(initialReservations);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("request");

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return Boolean(availableDates[dateStr]);
  };

  const getAvailableSlotsForDate = (date: Date | undefined) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return availableDates[dateStr]?.slots || [];
  };

  const handleReservationSubmit = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please select a time slot");
      return;
    }

    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const result = await createReservation({
        date: dateStr,
        startTime,
        endTime,
        childrenCount: parseInt(childrenCount),
        notes,
      });

      if (result.success) {
        toast.success("Babysitting request submitted successfully");

        // Add to local state
        const newReservation: Reservation = {
          id: result.data?.id || Math.random(), // Fallback to random ID if needed
          date: dateStr,
          startTime,
          endTime,
          childrenCount: parseInt(childrenCount),
          status: "Pending",
        };

        setReservations((prev) => [...prev, newReservation]);

        // Reset form
        setStartTime("");
        setEndTime("");
        setChildrenCount("1");
        setNotes("");
        setActiveTab("reservations");
      } else {
        toast.error(result.message || "Failed to submit request");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setStartTime(slot.start);
    setEndTime(slot.end);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Family Babysitting
        </h1>
        <p className="text-muted-foreground">
          Request and manage babysitting sessions with your family
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="request">Request Babysitting</TabsTrigger>
          <TabsTrigger value="reservations">My Reservations</TabsTrigger>
        </TabsList>

        {/* Request Babysitting Tab */}
        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Babysitting</CardTitle>
              <CardDescription>
                Select a date and time when you need babysitting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Select a Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      available: (date) => isDateAvailable(date),
                    }}
                    modifiersStyles={{
                      available: {
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                      },
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Green dates indicate grandparent availability
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/request"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Need a custom time? Use advanced request form
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      {selectedDate
                        ? selectedDate.toDateString()
                        : "Select a date"}
                    </h3>
                    {selectedDate &&
                    getAvailableSlotsForDate(selectedDate).length > 0 ? (
                      <>
                        <h4 className="text-sm font-medium mb-2">
                          Available Time Slots
                        </h4>
                        <div className="space-y-2">
                          {getAvailableSlotsForDate(selectedDate).map(
                            (slot) => (
                              <div
                                key={slot.id}
                                className={`p-2 border rounded-md cursor-pointer transition-colors ${
                                  startTime === slot.start &&
                                  endTime === slot.end
                                    ? "bg-green-50 border-green-200"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => handleSlotSelect(slot)}
                              >
                                <p>
                                  {formatTime(slot.start)} -{" "}
                                  {formatTime(slot.end)}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {selectedDate
                          ? "No availability for this date. Please select another date."
                          : "Please select a date to see available times."}
                      </p>
                    )}
                  </div>

                  {startTime && endTime && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <label
                          htmlFor="childrenCount"
                          className="block text-sm font-medium mb-1"
                        >
                          Number of Children
                        </label>
                        <select
                          id="childrenCount"
                          value={childrenCount}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setChildrenCount(e.target.value)
                          }
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5+</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="notes"
                          className="block text-sm font-medium mb-1"
                        >
                          Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          placeholder="Any special instructions or information"
                          value={notes}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setNotes(e.target.value)}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 resize-none"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleReservationSubmit}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Reservations</CardTitle>
              <CardDescription>
                View and manage your babysitting reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((reservation) => (
                      <div
                        key={reservation.id}
                        className="p-4 border rounded-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {new Date(reservation.date).toDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(reservation.startTime)} -{" "}
                              {formatTime(reservation.endTime)}
                            </p>
                            <p className="text-sm">
                              Children: {reservation.childrenCount}
                            </p>
                          </div>
                          <span
                            className={`text-xs rounded-full px-2 py-0.5 ${
                              reservation.status === "Confirmed"
                                ? "bg-green-100 text-green-800"
                                : reservation.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You don&apos;t have any reservations yet.
                  </p>
                  <Button
                    onClick={() => setActiveTab("request")}
                    variant="outline"
                    className="mt-4"
                  >
                    Request Babysitting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
