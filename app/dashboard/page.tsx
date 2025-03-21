"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - to be replaced with actual data from backend later
  const upcomingReservations = [
    {
      id: 1,
      date: "March 25, 2024",
      time: "6:00 PM - 9:00 PM",
      status: "Confirmed",
    },
    {
      id: 2,
      date: "March 30, 2024",
      time: "5:00 PM - 8:00 PM",
      status: "Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your babysitting schedule and availability
        </p>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 justify-start px-4"
                onClick={() => (window.location.href = "/availability")}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Update Availability</span>
                  <span className="text-muted-foreground text-sm">
                    Set when you're available to babysit
                  </span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-20 justify-start px-4"
                onClick={() => (window.location.href = "/reservations")}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">View Reservations</span>
                  <span className="text-muted-foreground text-sm">
                    See upcoming bookings
                  </span>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reservations</CardTitle>
              <CardDescription>
                Your scheduled babysitting sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{reservation.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.time}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`text-sm rounded-full px-2.5 py-0.5 ${
                            reservation.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
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
                <p>No upcoming reservations.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Schedule</CardTitle>
              <CardDescription>
                View your availability and reservations
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Calendar view will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Settings will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
