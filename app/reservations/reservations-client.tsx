"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createReservation, getUserReservations } from "@/app/actions";
import { formatTime } from "@/app/lib/utils";
import { useEffect } from "react";

interface Reservation {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  childrenCount: number;
  status: "Pending" | "Confirmed" | "Cancelled";
}

type AvailableSlot = {
  id: number;
  start: string;
  end: string;
};

interface ReservationsClientProps {
  initialAvailableDates: Record<string, { date: Date; slots: AvailableSlot[] }>;
}

export function ReservationsClient({
  initialAvailableDates,
}: ReservationsClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("17:00"); // 5:00 PM
  const [endTime, setEndTime] = useState("20:00"); // 8:00 PM
  const [childrenCount, setChildrenCount] = useState("1");
  const [notes, setNotes] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDates] = useState(initialAvailableDates);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const result = await getUserReservations();
        if (result.success && result.data) {
          setReservations(result.data);
        }
      } catch (error) {
        toast.error("Failed to load your reservations");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return Boolean(availableDates[dateStr]);
  };

  const handleSubmitReservation = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    // Validate time selection
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
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
        // Close dialog and show success message
        setIsDialogOpen(false);
        toast.success("Reservation request submitted");

        // Fetch updated reservations
        const reservationsResult = await getUserReservations();
        if (reservationsResult.success && reservationsResult.data) {
          setReservations(reservationsResult.data);
        }

        // Reset form
        setStartTime("17:00");
        setEndTime("20:00");
        setChildrenCount("1");
        setNotes("");
      } else {
        toast.error(result.message || "Failed to create reservation");
      }
    } catch (error) {
      toast.error("Failed to create reservation");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    try {
      // Here you would call an API to cancel the reservation
      // For now, just update the local state
      setReservations(reservations.filter((r) => r.id !== id));
      toast.success("Reservation cancelled");
    } catch (error) {
      toast.error("Failed to cancel reservation");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
        <p className="text-muted-foreground">
          Book babysitting sessions on available dates
        </p>
      </div>

      <Tabs defaultValue="new">
        <TabsList className="mb-4">
          <TabsTrigger value="new">New Reservation</TabsTrigger>
          <TabsTrigger value="existing">Your Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
              <CardDescription>
                Green dates indicate babysitter availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
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
            <CardFooter className="justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      !selectedDate ||
                      !isDateAvailable(selectedDate as Date) ||
                      isLoading
                    }
                  >
                    Book This Date
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Babysitting</DialogTitle>
                    <DialogDescription>
                      {selectedDate
                        ? selectedDate.toDateString()
                        : "Select a date"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-2">
                        <label
                          htmlFor="startTime"
                          className="text-sm font-medium"
                        >
                          Start Time
                        </label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label
                          htmlFor="endTime"
                          className="text-sm font-medium"
                        >
                          End Time
                        </label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="children" className="text-sm font-medium">
                        Number of Children
                      </label>
                      <Select
                        value={childrenCount}
                        onValueChange={setChildrenCount}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        Notes (Optional)
                      </label>
                      <Input
                        id="notes"
                        placeholder="Any special instructions or information"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReservation}
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Submit Reservation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Reservations</CardTitle>
              <CardDescription>
                Manage your babysitting bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading your reservations...</p>
              ) : reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex justify-between items-center p-4 border rounded-md"
                    >
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
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-sm rounded-full px-2.5 py-0.5 ${
                            reservation.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : reservation.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {reservation.status}
                        </span>
                        {reservation.status !== "Cancelled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reservations found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
