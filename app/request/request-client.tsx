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
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { createBookingRequest } from "@/app/actions";

interface RequestPageProps {
  initialAvailableDates: Record<
    string,
    { date: Date; slots: { id: number; start: string; end: string }[] }
  >;
}

export function RequestPage({ initialAvailableDates }: RequestPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with query params if available
  const initialDate = searchParams.get("date")
    ? new Date(searchParams.get("date") as string)
    : new Date();

  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [startTime, setStartTime] = useState(
    searchParams.get("startTime") || "17:00"
  );
  const [endTime, setEndTime] = useState(
    searchParams.get("endTime") || "20:00"
  );
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
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

    if (!parentName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setSubmitting(true);

    try {
      // In a real app, you would first create a parent record if needed
      // For this example, we're using the parent ID we just created
      const formData = new FormData();
      formData.append("parentId", "11"); // Updated to match our new parent ID
      formData.append("date", format(date, "yyyy-MM-dd"));
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append("notes", notes);

      const result = await createBookingRequest(formData);

      if (result.success) {
        toast.success("Babysitting request submitted successfully!");

        // Redirect to home page after submission
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to submit request");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("An unexpected error occurred");
      setSubmitting(false);
    }
  }

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
          Let us know when you need babysitting
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Green dates show when babysitters are available
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
                  }}
                  modifiersStyles={{
                    available: { backgroundColor: "#dcfce7", color: "#166534" },
                  }}
                />
              </div>

              {date && isDateAvailable(date) && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    Available Time Slots:
                  </h3>
                  <div className="space-y-2">
                    {getAvailableTimeSlots(date).map((slot) => (
                      <div
                        key={slot.id}
                        className="text-sm p-2 border rounded flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setStartTime(slot.start);
                          setEndTime(slot.end);
                        }}
                      >
                        <span>
                          {formatTime(slot.start)} - {formatTime(slot.end)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStartTime(slot.start);
                            setEndTime(slot.end);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </label>
                <Input
                  id="name"
                  placeholder="e.g. John Smith"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

                {parentName && (
                  <>
                    <span className="text-muted-foreground">Requested by:</span>
                    <span>{parentName}</span>
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
