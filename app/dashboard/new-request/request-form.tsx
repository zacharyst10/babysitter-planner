"use client";

import { createBookingRequest } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface RequestFormProps {
  parents: Parent[];
}

export function RequestForm({ parents }: RequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createBookingRequest(formData);

        if (result.success) {
          toast.success("Booking request created successfully");
          router.push("/");
        } else {
          toast.error(result.error || "Failed to create booking request");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="max-w-lg border rounded-lg p-6 bg-white shadow-sm"
    >
      <div className="mb-4">
        <label htmlFor="parentId" className="block text-sm font-medium mb-1">
          Parent
        </label>
        <select
          id="parentId"
          name="parentId"
          required
          className="w-full p-2 border rounded-md"
          disabled={isPending}
        >
          <option value="">Select a parent</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          className="w-full p-2 border rounded-md"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            required
            className="w-full p-2 border rounded-md"
            disabled={isPending}
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            required
            className="w-full p-2 border rounded-md"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full p-2 border rounded-md"
          placeholder="Any special requirements or additional information"
          disabled={isPending}
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
