/**
 * API service for interacting with the backend
 */

// Base fetch wrapper with error handling
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Bookings API
export const bookingsApi = {
  // Get all bookings with optional filters
  getAll: async (filters?: { parentId?: number; babysitterId?: number }) => {
    const searchParams = new URLSearchParams();

    if (filters?.parentId) {
      searchParams.append("parentId", filters.parentId.toString());
    }

    if (filters?.babysitterId) {
      searchParams.append("babysitterId", filters.babysitterId.toString());
    }

    const queryString = searchParams.toString();
    const url = `/api/bookings${queryString ? `?${queryString}` : ""}`;

    return fetchWithErrorHandling(url);
  },

  // Get a single booking by ID
  getById: async (id: number) => {
    return fetchWithErrorHandling(`/api/bookings/${id}`);
  },

  // Create a new booking
  create: async (bookingData: {
    parentId: number;
    babysitterId: number;
    requestId: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    return fetchWithErrorHandling("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });
  },

  // Update a booking
  update: async (
    id: number,
    bookingData: Partial<{
      date: string;
      startTime: string;
      endTime: string;
      notes: string;
      status: string;
    }>
  ) => {
    return fetchWithErrorHandling(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel a booking
  cancel: async (id: number) => {
    return fetchWithErrorHandling(`/api/bookings/${id}/cancel`, {
      method: "POST",
    });
  },
};

// Booking requests API
export const requestsApi = {
  // Get all booking requests with optional filters
  getAll: async (filters?: { parentId?: number; status?: string }) => {
    const searchParams = new URLSearchParams();

    if (filters?.parentId) {
      searchParams.append("parentId", filters.parentId.toString());
    }

    if (filters?.status) {
      searchParams.append("status", filters.status);
    }

    const queryString = searchParams.toString();
    const url = `/api/requests${queryString ? `?${queryString}` : ""}`;

    return fetchWithErrorHandling(url);
  },

  // Create a new booking request
  create: async (requestData: {
    parentId: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    return fetchWithErrorHandling("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
  },
};

// Availability API
export const availabilityApi = {
  // Get available time slots with optional filters
  getAvailableSlots: async (filters: {
    date: string;
    babysitterId?: number;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append("date", filters.date);

    if (filters.babysitterId) {
      searchParams.append("babysitterId", filters.babysitterId.toString());
    }

    const queryString = searchParams.toString();
    const url = `/api/availability${queryString ? `?${queryString}` : ""}`;

    return fetchWithErrorHandling(url);
  },

  // Add new availability for a babysitter
  addAvailability: async (availabilityData: {
    babysitterId: number;
    date: string;
    startTime: string;
    endTime: string;
    recurring?: boolean;
  }) => {
    return fetchWithErrorHandling("/api/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(availabilityData),
    });
  },
};
