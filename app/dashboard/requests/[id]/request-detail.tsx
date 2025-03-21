"use client";

import Link from "next/link";
import RequestStatusActions from "@/app/components/RequestStatusActions";
import { RequestDetailClientWrapper } from "./client";

interface RequestDetailProps {
  bookingRequest: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    notes: string | null;
  };
  parent: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export function RequestDetail({ bookingRequest, parent }: RequestDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Booking Request #{bookingRequest.id}
        </h1>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-lg font-medium">
              {formatDate(bookingRequest.date)}
            </p>
            <p className="text-gray-600">
              {bookingRequest.startTime} - {bookingRequest.endTime}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[bookingRequest.status]
            }`}
          >
            {bookingRequest.status.charAt(0).toUpperCase() +
              bookingRequest.status.slice(1)}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Parent Information</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{parent.name}</p>
            <p className="text-gray-600">{parent.email}</p>
            <p className="text-gray-600">{parent.phone}</p>
          </div>
        </div>

        {bookingRequest.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Notes</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700">{bookingRequest.notes}</p>
            </div>
          </div>
        )}

        {bookingRequest.status === "pending" && (
          <RequestDetailClientWrapper
            requestId={bookingRequest.id}
            status={bookingRequest.status}
            date={bookingRequest.date}
            startTime={bookingRequest.startTime}
            endTime={bookingRequest.endTime}
          />
        )}

        {bookingRequest.status !== "pending" && (
          <RequestStatusActions
            requestId={bookingRequest.id}
            status={bookingRequest.status}
          />
        )}
      </div>
    </div>
  );
}
