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
import { format } from "date-fns";
import { toast } from "sonner";
import { addAvailability, removeAvailability } from "@/app/actions";

interface AvailabilityCalendarProps {
  initialAvailableDates: Record<
    string,
    { date: Date; slots: { id: number; start: string; end: string }[] }
  >;
}

export function AvailabilityCalendar({
  initialAvailableDates,
}: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState(initialAvailableDates);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(0);

  const timeSlots = [
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "17:00" },
    { start: "18:00", end: "22:00" },
  ];

  const handleSaveAvailability = async () => {
    if (!date) return;

    const formattedDate = format(date, "yyyy-MM-dd");
    const selectedSlot = timeSlots[selectedTimeSlot];

    try {
      // We're using babysitterId 12 for simplicity - in a real app you'd get this from auth
      const result = await addAvailability({
        babysitterId: 12,
        date: formattedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        recurring: false,
      });

      if (result.success && result.data) {
        toast.success("Added available time slot");
        // Update local state with new data
        const newSlot = {
          id: result.data.id,
          start: result.data.startTime,
          end: result.data.endTime,
        };

        setAvailableDates((prev) => {
          const updated = { ...prev };
          if (!updated[formattedDate]) {
            updated[formattedDate] = {
              date: date,
              slots: [],
            };
          }
          updated[formattedDate].slots.push(newSlot);
          return updated;
        });
      } else {
        toast.error(result.error || "Failed to save availability");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    }

    setIsDialogOpen(false);
  };

  const handleRemoveSlot = async (slotId: number, dateString: string) => {
    try {
      const result = await removeAvailability(slotId);

      if (result.success) {
        toast.success("Removed time slot");

        // Update local state
        setAvailableDates((prev) => {
          const updated = { ...prev };
          if (updated[dateString]) {
            const newSlots = updated[dateString].slots.filter(
              (s) => s.id !== slotId
            );
            if (newSlots.length === 0) {
              delete updated[dateString];
            } else {
              updated[dateString].slots = newSlots;
            }
          }
          return updated;
        });
      } else {
        toast.error(result.error || "Failed to remove slot");
      }
    } catch (error) {
      console.error("Error removing slot:", error);
      toast.error("Failed to remove slot");
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dateStr in availableDates;
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
              }}
              modifiersStyles={{
                available: { backgroundColor: "#dcfce7", color: "#166534" },
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
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Set Availability</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Availability</DialogTitle>
                <DialogDescription>
                  {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
            {Object.entries(availableDates).length > 0 ? (
              Object.entries(availableDates).map(([dateStr, dateItem]) => (
                <div key={dateStr} className="border rounded-md p-3">
                  <p className="font-medium mb-2">
                    {format(new Date(dateItem.date), "MMMM d, yyyy")}
                  </p>
                  {dateItem.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="text-sm">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveSlot(slot.id, dateStr)}
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
  );
}
