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

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("17:00"); // 5:00 PM
  const [endTime, setEndTime] = useState("20:00"); // 8:00 PM
  const [childrenCount, setChildrenCount] = useState("1");
  const [notes, setNotes] = useState("");

  // Mock reservations data - to be replaced with actual data from backend later
  const [reservations, setReservations] = useState([
    {
      id: 1,
      date: new Date(2024, 2, 27), // March 27, 2024
      startTime: "18:00",
      endTime: "21:00",
      childrenCount: 2,
      status: "Confirmed",
    },
    {
      id: 2,
      date: new Date(2024, 3, 5), // April 5, 2024
      startTime: "17:30",
      endTime: "20:30",
      childrenCount: 1,
      status: "Pending",
    },
  ]);

  // Mock available dates - to be replaced with actual data from backend later
  const availableDates = [
    new Date(2024, 2, 22), // March 22, 2024
    new Date(2024, 2, 23), // March 23, 2024
    new Date(2024, 2, 27), // March 27, 2024
    new Date(2024, 2, 28), // March 28, 2024
    new Date(2024, 3, 5), // April 5, 2024
  ];

  const isDateAvailable = (date: Date) => {
    return availableDates.some((d) => d.toDateString() === date.toDateString());
  };

  const handleSubmitReservation = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    // Validate time selection
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    // Create new reservation
    const newReservation = {
      id: Math.max(0, ...reservations.map((r) => r.id)) + 1,
      date: selectedDate,
      startTime,
      endTime,
      childrenCount: parseInt(childrenCount),
      status: "Pending",
    };

    // Add to reservations
    setReservations([...reservations, newReservation]);

    // Close dialog and show success message
    setIsDialogOpen(false);
    toast.success("Reservation request submitted");

    // Reset form
    setStartTime("17:00");
    setEndTime("20:00");
    setChildrenCount("1");
    setNotes("");
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
                      !selectedDate || !isDateAvailable(selectedDate as Date)
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
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReservation}>
                      Submit Reservation
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
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex justify-between items-center p-4 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">
                          {reservation.date.toDateString()}
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
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {reservation.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReservations(
                              reservations.filter(
                                (r) => r.id !== reservation.id
                              )
                            );
                            toast.success("Reservation cancelled");
                          }}
                        >
                          Cancel
                        </Button>
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
