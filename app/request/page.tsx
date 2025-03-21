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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RequestPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("17:00"); // 5:00 PM
  const [endTime, setEndTime] = useState("20:00"); // 8:00 PM
  const [childrenCount, setChildrenCount] = useState("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!isDateAvailable(date)) {
      toast.error("Selected date is not available for babysitting");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Submit the babysitting request
    setSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      toast.success("Babysitting request submitted successfully!");
      setSubmitting(false);

      // Redirect to home page after submission
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1000);
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
          Request Babysitting
        </h1>
        <p className="text-muted-foreground">
          Let Grandma and Grandpa know when you need babysitting
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Green dates show when Grandma and Grandpa are available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
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
                    unavailable: {
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Tell us about your babysitting needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startTime" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endTime" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="children" className="text-sm font-medium">
                  Number of Children
                </label>
                <select
                  id="children"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(e.target.value)}
                  required
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Your Name(s)
                </label>
                <Input
                  id="name"
                  placeholder="e.g. Emily & Jason"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  placeholder="e.g. 555-123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any special instructions or information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !date || !isDateAvailable(date as Date)}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Reservation Summary</CardTitle>
          <CardDescription>Review your babysitting request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {date ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span>{date.toDateString()}</span>

                <span className="text-muted-foreground">Time:</span>
                <span>
                  {formatTime(startTime)} - {formatTime(endTime)}
                </span>

                <span className="text-muted-foreground">Children:</span>
                <span>{childrenCount}</span>

                {name && (
                  <>
                    <span className="text-muted-foreground">Requested by:</span>
                    <span>{name}</span>
                  </>
                )}

                {phone && (
                  <>
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{phone}</span>
                  </>
                )}
              </div>

              {notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm bg-muted p-2 rounded-md">{notes}</p>
                </div>
              )}

              {!isDateAvailable(date) && (
                <p className="text-sm text-red-500 mt-2">
                  Note: The selected date is not available for babysitting.
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Please select a date and fill in the request details.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
