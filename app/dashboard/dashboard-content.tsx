"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

interface DashboardSummary {
  parents_count: number;
  babysitters_count: number;
  availability_count: number;
  requests_count: number;
  bookings_count: number;
}

interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Babysitter {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
}

interface BookingRequest {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  parent: {
    id: number;
    name: string;
    email: string;
  };
}

interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  parent: {
    id: number;
    name: string;
  };
  babysitter: {
    id: number;
    name: string;
  };
}

interface DashboardContentProps {
  dashboardData: {
    summary: DashboardSummary;
    parents: Parent[];
    babysitters: Babysitter[];
    bookingRequests: BookingRequest[];
    bookings: Booking[];
  };
}

export function DashboardContent({ dashboardData }: DashboardContentProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/new-request"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Request
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Parents"
          value={dashboardData.summary.parents_count}
          description="Registered families"
        />
        <StatsCard
          title="Babysitters"
          value={dashboardData.summary.babysitters_count}
          description="Available sitters"
        />
        <StatsCard
          title="Bookings"
          value={dashboardData.summary.bookings_count}
          description="Confirmed appointments"
        />
        <StatsCard
          title="Requests"
          value={dashboardData.summary.requests_count}
          description="Total booking requests"
        />
        <StatsCard
          title="Availability"
          value={dashboardData.summary.availability_count}
          description="Available time slots"
        />
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="babysitters">Babysitters</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Confirmed Bookings</h2>
          {dashboardData.bookings.length === 0 ? (
            <p>No bookings found</p>
          ) : (
            <div className="grid gap-4">
              {dashboardData.bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Booking Requests</h2>
          {dashboardData.bookingRequests.length === 0 ? (
            <p>No requests found</p>
          ) : (
            <div className="grid gap-4">
              {dashboardData.bookingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="babysitters" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Babysitters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.babysitters.map((sitter) => (
              <BabysitterCard key={sitter.id} sitter={sitter} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="parents" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Parents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.parents.map((parent) => (
              <ParentCard key={parent.id} parent={parent} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Booking on {format(new Date(booking.date), "MMM d, yyyy")}
          </CardTitle>
          <StatusBadge status={booking.status} />
        </div>
        <CardDescription>
          {format(new Date(`2000-01-01T${booking.startTime}`), "h:mm a")} -
          {format(new Date(`2000-01-01T${booking.endTime}`), "h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-sm font-semibold">Parent</p>
            <p>{booking.parent.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Babysitter</p>
            <p>{booking.babysitter.name}</p>
          </div>
        </div>
        {booking.notes && (
          <div className="mt-2">
            <p className="text-sm font-semibold">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RequestCard({ request }: { request: BookingRequest }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Request for {format(new Date(request.date), "MMM d, yyyy")}
          </CardTitle>
          <StatusBadge status={request.status} />
        </div>
        <CardDescription>
          {format(new Date(`2000-01-01T${request.startTime}`), "h:mm a")} -
          {format(new Date(`2000-01-01T${request.endTime}`), "h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <p className="text-sm font-semibold">Parent</p>
          <p>{request.parent.name}</p>
          <p className="text-sm">{request.parent.email}</p>
        </div>
        {request.notes && (
          <div className="mt-2">
            <p className="text-sm font-semibold">Notes</p>
            <p className="text-sm">{request.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BabysitterCard({ sitter }: { sitter: Babysitter }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{sitter.name}</CardTitle>
        <CardDescription>{sitter.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold">Phone</p>
        <p className="mb-2">{sitter.phone}</p>
        {sitter.bio && (
          <>
            <p className="text-sm font-semibold">Bio</p>
            <p className="text-sm">{sitter.bio}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ParentCard({ parent }: { parent: Parent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{parent.name}</CardTitle>
        <CardDescription>{parent.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold">Phone</p>
        <p>{parent.phone}</p>
      </CardContent>
    </Card>
  );
}
