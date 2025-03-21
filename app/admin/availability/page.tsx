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
import { toast } from "sonner";

export default function AdminAvailabilityPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availabilityType, setAvailabilityType] = useState<
    "available" | "unavailable"
  >("available");
  const timeSlots = [
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "17:00" },
    { start: "18:00", end: "22:00" },
  ];
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(0);

  // Mock availability data - to be replaced with actual data from backend later
  const [availableDates, setAvailableDates] = useState<
    {
      date: Date;
      slots: { start: string; end: string }[];
    }[]
  >([
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
  ]);

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([
    new Date(2024, 2, 24), // March 24, 2024
    new Date(2024, 2, 25), // March 25, 2024
  ]);

  const handleSaveAvailability = () => {
    if (!date) return;

    if (availabilityType === "available") {
      // Remove from unavailable if it exists
      setUnavailableDates(
        unavailableDates.filter((d) => d.toDateString() !== date.toDateString())
      );

      // Add to available if it doesn't exist
      const existingDateIndex = availableDates.findIndex(
        (d) => d.date.toDateString() === date.toDateString()
      );

      if (existingDateIndex === -1) {
        // Add new date with selected time slot
        setAvailableDates([
          ...availableDates,
          {
            date: date,
            slots: [timeSlots[selectedTimeSlot]],
          },
        ]);
      } else {
        // Update existing date
        const updatedDates = [...availableDates];
        const currentSlots = updatedDates[existingDateIndex].slots;

        // Check if time slot already exists
        const slotExists = currentSlots.some(
          (slot) =>
            slot.start === timeSlots[selectedTimeSlot].start &&
            slot.end === timeSlots[selectedTimeSlot].end
        );

        if (!slotExists) {
          updatedDates[existingDateIndex] = {
            ...updatedDates[existingDateIndex],
            slots: [...currentSlots, timeSlots[selectedTimeSlot]],
          };
          setAvailableDates(updatedDates);
        }
      }

      toast.success("Added available time slot");
    } else {
      // Remove from available if it exists
      const existingDateIndex = availableDates.findIndex(
        (d) => d.date.toDateString() === date.toDateString()
      );

      if (existingDateIndex !== -1) {
        const updatedDates = [...availableDates];
        updatedDates.splice(existingDateIndex, 1);
        setAvailableDates(updatedDates);
      }

      // Add to unavailable if it doesn't exist
      if (
        !unavailableDates.some((d) => d.toDateString() === date.toDateString())
      ) {
        setUnavailableDates([...unavailableDates, date]);
      }

      toast.success("Marked as unavailable");
    }

    setIsDialogOpen(false);
  };

  const removeAvailableSlot = (dateIndex: number, slotIndex: number) => {
    const updatedDates = [...availableDates];
    const currentSlots = updatedDates[dateIndex].slots;

    if (currentSlots.length === 1) {
      // If this is the only slot, remove the entire date
      updatedDates.splice(dateIndex, 1);
    } else {
      // Otherwise just remove the slot
      currentSlots.splice(slotIndex, 1);
      updatedDates[dateIndex] = {
        ...updatedDates[dateIndex],
        slots: currentSlots,
      };
    }

    setAvailableDates(updatedDates);
    toast.success("Removed time slot");
  };

  const removeUnavailableDate = (index: number) => {
    const updatedDates = [...unavailableDates];
    updatedDates.splice(index, 1);
    setUnavailableDates(updatedDates);
    toast.success("Removed unavailable date");
  };

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
          Manage Your Availability
        </h1>
        <p className="text-muted-foreground">
          Set when you are available or unavailable for babysitting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Availability Calendar</CardTitle>
            <CardDescription>
              Click on a date to set your availability
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
          <CardFooter className="flex justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded mr-2 bg-[#dcfce7]"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 rounded mr-2 bg-[#fee2e2]"></div>
                <span className="text-sm">Unavailable</span>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Set Availability</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Availability</DialogTitle>
                  <DialogDescription>
                    {date ? date.toDateString() : "Select a date"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={
                          availabilityType === "available"
                            ? "default"
                            : "outline"
                        }
                        className="flex-1"
                        onClick={() => setAvailabilityType("available")}
                      >
                        Available
                      </Button>
                      <Button
                        variant={
                          availabilityType === "unavailable"
                            ? "default"
                            : "outline"
                        }
                        className="flex-1"
                        onClick={() => setAvailabilityType("unavailable")}
                      >
                        Unavailable
                      </Button>
                    </div>
                  </div>

                  {availabilityType === "available" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Select time slot:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {timeSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedTimeSlot === index ? "default" : "outline"
                            }
                            onClick={() => setSelectedTimeSlot(index)}
                            className="justify-start h-auto py-2"
                          >
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAvailability}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Times</CardTitle>
            <CardDescription>Your scheduled availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableDates.length > 0 ? (
                availableDates.map((dateItem, dateIndex) => (
                  <div key={dateIndex} className="border rounded-md p-3">
                    <p className="font-medium mb-2">
                      {dateItem.date.toDateString()}
                    </p>
                    {dateItem.slots.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="text-sm">
                          {formatTime(slot.start)} - {formatTime(slot.end)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            removeAvailableSlot(dateIndex, slotIndex)
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p>No available times set.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unavailable Dates</CardTitle>
          <CardDescription>
            Dates you&apos;ve marked as completely unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unavailableDates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unavailableDates.map((date, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <span>{date.toDateString()}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeUnavailableDate(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>No unavailable dates set.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
