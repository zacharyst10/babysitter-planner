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
import {
  addAvailability,
  removeAvailability,
  updateRequestStatus,
  createBooking,
} from "@/app/actions";
import { formatTime } from "@/lib/utils";

type AvailabilitySlot = {
  id: number;
  babysitterId: number;
  date: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
};

type BookingRequest = {
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
};

interface AdminClientProps {
  initialAvailability: AvailabilitySlot[];
  pendingRequests: BookingRequest[];
  confirmedRequests: BookingRequest[];
}

export function AdminClient({
  initialAvailability,
  pendingRequests,
  confirmedRequests,
}: AdminClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [availability, setAvailability] =
    useState<AvailabilitySlot[]>(initialAvailability);
  const [requests, setRequests] = useState({
    pending: pendingRequests,
    confirmed: confirmedRequests,
  });

  // Time slots for selection
  const timeSlots = [
    { start: "09:00", end: "11:00" },
    { start: "11:00", end: "13:00" },
    { start: "13:00", end: "15:00" },
    { start: "15:00", end: "17:00" },
    { start: "17:00", end: "19:00" },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getAvailabilityForDate = (date: Date | undefined) => {
    if (!date) return [];

    const dateStr = date.toISOString().split("T")[0];
    return availability.filter((slot) => slot.date === dateStr);
  };

  const isDateAvailable = (date: Date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split("T")[0];
    return availability.some((slot) => slot.date === dateStr);
  };

  const handleAddAvailability = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setIsAddingAvailability(true);

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const result = await addAvailability({
        babysitterId: 12, // Update to match your babysitter ID
        date: dateStr,
        startTime,
        endTime,
        recurring: false,
      });

      if (result.success && result.data) {
        toast.success("Availability added successfully");
        // Cast the result.data to AvailabilitySlot to ensure type compatibility
        const newSlot: AvailabilitySlot = {
          id: result.data.id,
          babysitterId: result.data.babysitterId,
          date: result.data.date,
          startTime: result.data.startTime,
          endTime: result.data.endTime,
          recurring: result.data.recurring ?? false,
        };
        setAvailability((prev) => [...prev, newSlot]);
      } else {
        toast.error(result.error || "Failed to add availability");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsAddingAvailability(false);
    }
  };

  const handleRemoveAvailability = async (id: number) => {
    try {
      const result = await removeAvailability(id);

      if (result.success) {
        toast.success("Availability removed");
        setAvailability((prev) => prev.filter((slot) => slot.id !== id));
      } else {
        toast.error(result.error || "Failed to remove availability");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleApproveRequest = async (request: BookingRequest) => {
    try {
      // First approve the request
      await updateRequestStatus({
        requestId: request.id,
        status: "confirmed",
      });

      // Then create a booking
      const bookingResult = await createBooking({
        requestId: request.id,
        babysitterId: 12, // Update to match your babysitter ID
      });

      if (bookingResult.success) {
        toast.success("Request approved and booking created");

        // Update local state
        setRequests((prev) => ({
          pending: prev.pending.filter((r) => r.id !== request.id),
          confirmed: [...prev.confirmed, { ...request, status: "confirmed" }],
        }));
      } else {
        toast.error(bookingResult.error || "Failed to create booking");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleDeclineRequest = async (request: BookingRequest) => {
    try {
      const result = await updateRequestStatus({
        requestId: request.id,
        status: "cancelled",
      });

      if (result.success) {
        toast.success("Request declined");

        // Update local state
        setRequests((prev) => ({
          pending: prev.pending.filter((r) => r.id !== request.id),
          confirmed: prev.confirmed,
        }));
      } else {
        toast.error(result.error || "Failed to decline request");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Family Babysitting Admin
        </h1>
        <p className="text-muted-foreground">
          Manage your availability and babysitting requests
        </p>
      </div>

      <Tabs defaultValue="availability">
        <TabsList className="mb-4">
          <TabsTrigger value="availability">Manage Availability</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed Bookings</TabsTrigger>
        </TabsList>

        {/* Availability Management Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Your Availability</CardTitle>
              <CardDescription>
                Select dates and times when you&apos;re available to babysit
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
                    Green dates indicate existing availability
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      {selectedDate
                        ? selectedDate.toDateString()
                        : "Select a date"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Time Slot</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label
                              htmlFor="startTime"
                              className="text-sm text-muted-foreground"
                            >
                              Start Time
                            </label>
                            <select
                              id="startTime"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                            >
                              {timeSlots.map((slot) => (
                                <option
                                  key={`start-${slot.start}`}
                                  value={slot.start}
                                >
                                  {formatTime(slot.start)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="endTime"
                              className="text-sm text-muted-foreground"
                            >
                              End Time
                            </label>
                            <select
                              id="endTime"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                            >
                              {timeSlots.map((slot) => (
                                <option
                                  key={`end-${slot.end}`}
                                  value={slot.end}
                                >
                                  {formatTime(slot.end)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddAvailability}
                        disabled={isAddingAvailability || !selectedDate}
                        className="w-full"
                      >
                        {isAddingAvailability
                          ? "Adding..."
                          : "Add Availability"}
                      </Button>
                    </div>

                    {/* Current Availability for Selected Date */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">
                        Current Availability for {selectedDate?.toDateString()}
                      </h4>
                      {getAvailabilityForDate(selectedDate).length > 0 ? (
                        <div className="space-y-2">
                          {getAvailabilityForDate(selectedDate).map((slot) => (
                            <div
                              key={slot.id}
                              className="p-2 border rounded-md flex justify-between items-center"
                            >
                              <p>
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </p>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleRemoveAvailability(slot.id)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No availability set for this date.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Babysitting Requests</CardTitle>
              <CardDescription>
                Review and approve requests from family members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.pending.length > 0 ? (
                <div className="space-y-4">
                  {requests.pending.map((request) => (
                    <div key={request.id} className="p-4 border rounded-md">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {formatDate(request.date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(request.startTime)} -{" "}
                            {formatTime(request.endTime)}
                          </p>
                          <p className="text-sm mt-2">
                            From: {request.parent.name} ({request.parent.phone})
                          </p>
                          {request.notes && (
                            <p className="text-sm mt-1 italic">
                              Note: {request.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 self-end md:self-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeclineRequest(request)}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confirmed Bookings Tab */}
        <TabsContent value="confirmed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Bookings</CardTitle>
              <CardDescription>
                View your upcoming confirmed babysitting sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.confirmed.length > 0 ? (
                <div className="space-y-4">
                  {requests.confirmed
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-md">
                        <div>
                          <div className="flex justify-between">
                            <p className="font-medium">
                              {formatDate(booking.date)}
                            </p>
                            <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </p>
                          <p className="text-sm mt-2">
                            For: {booking.parent.name} ({booking.parent.phone})
                          </p>
                          {booking.notes && (
                            <p className="text-sm mt-1 italic">
                              Note: {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No confirmed bookings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
