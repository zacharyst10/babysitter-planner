"use client";

import { useState, useEffect } from "react";
import { getAvailableBabysitters } from "@/app/actions";

interface BabysitterType {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
}

interface AvailableBabysittersProps {
  date: string;
  startTime: string;
  endTime: string;
  onSelect: (babysitterId: number) => void;
}

export default function AvailableBabysitters({
  date,
  startTime,
  endTime,
  onSelect,
}: AvailableBabysittersProps) {
  const [babysitters, setBabysitters] = useState<BabysitterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBabysitters = async () => {
      setLoading(true);
      try {
        const result = await getAvailableBabysitters(date, startTime, endTime);
        if (result.success) {
          setBabysitters(result.data || []);
        } else {
          setError(result.error || "Failed to load babysitters");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, [date, startTime, endTime]);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    onSelect(id);
  };

  if (loading) {
    return (
      <div className="p-4 text-gray-500">Loading available babysitters...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (babysitters.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        No babysitters available for this time slot.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Available Babysitters</h3>
      <div className="space-y-3">
        {babysitters.map((babysitter) => (
          <div
            key={babysitter.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedId === babysitter.id
                ? "border-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelect(babysitter.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{babysitter.name}</h4>
                <p className="text-sm text-gray-600">{babysitter.email}</p>
                <p className="text-sm text-gray-600">{babysitter.phone}</p>
              </div>
              <div className="flex items-center h-full">
                <input
                  type="radio"
                  checked={selectedId === babysitter.id}
                  onChange={() => handleSelect(babysitter.id)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            </div>
            {babysitter.bio && (
              <p className="text-sm mt-2 text-gray-700">{babysitter.bio}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
