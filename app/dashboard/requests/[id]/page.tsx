import { db } from "@/lib/db";
import { bookingRequests, parents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { RequestDetail } from "./request-detail";

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const id = parseInt(params.id);

  // Fetch the booking request
  const request = await db.query.bookingRequests.findFirst({
    where: eq(bookingRequests.id, id),
  });

  if (!request) {
    notFound();
  }

  // Fetch the parent details
  const parent = await db.query.parents.findFirst({
    where: eq(parents.id, request.parentId),
  });

  if (!parent) {
    notFound();
  }

  return (
    <RequestDetail
      bookingRequest={{
        id: request.id,
        date: request.date,
        startTime: request.startTime,
        endTime: request.endTime,
        status: request.status,
        notes: request.notes,
      }}
      parent={{
        id: parent.id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
      }}
    />
  );
}
