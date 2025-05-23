// minibus-booking-platform/frontend/src/services/destinationService.ts
import axios from "axios";

const API_URL = "http://localhost:3001/api/destinations"; // Update to use full URL with backend port

// Function to get the auth token (placeholder - should be consistent with other services)
const getAuthToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

export interface Destination {
  _id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  status: "available" | "unavailable";
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for destination data when creating (ID is not yet assigned by DB)
export type DestinationData = Omit<
  Destination,
  "_id" | "createdAt" | "updatedAt"
>;
// Type for destination data when updating (ID is known, some fields optional)
export type DestinationUpdateData = Partial<DestinationData>;

// Get all destinations (for admin view)
export const getDestinations = async (): Promise<Destination[]> => {
  try {
    const token = getAuthToken();
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
    // If no token, and the route is protected, this will fail.
    // Appropriate handling (e.g. redirect to login) should be managed by the caller or a global interceptor.
    if (!token)
      console.warn(
        "Admin token not found for getDestinations. API call may fail."
      );

    const response = await axios.get<Destination[]>(API_URL, config);
    return response.data;
  } catch (error) {
    console.error("Error fetching destinations:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch destinations"
      );
    }
    throw new Error("Failed to fetch destinations due to an unexpected error.");
  }
};

// Create a new destination
export const createDestination = async (
  destinationData: DestinationData
): Promise<Destination> => {
  try {
    const token = getAuthToken();
    if (!token)
      throw new Error("Admin token not found. Cannot create destination.");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post<Destination>(
      API_URL,
      destinationData,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error creating destination:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to create destination"
      );
    }
    throw new Error("Failed to create destination due to an unexpected error.");
  }
};

// Update an existing destination
export const updateDestination = async (
  id: string,
  destinationData: DestinationUpdateData
): Promise<Destination> => {
  try {
    const token = getAuthToken();
    if (!token)
      throw new Error("Admin token not found. Cannot update destination.");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.put<Destination>(
      `${API_URL}/${id}`,
      destinationData,
      config
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating destination with ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to update destination"
      );
    }
    throw new Error("Failed to update destination due to an unexpected error.");
  }
};

// Delete a destination
export const deleteDestination = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const token = getAuthToken();
    if (!token)
      throw new Error("Admin token not found. Cannot delete destination.");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/${id}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting destination with ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to delete destination"
      );
    }
    throw new Error("Failed to delete destination due to an unexpected error.");
  }
};

// Get all available destinations (for public view)
export const getAvailableDestinations = async (): Promise<Destination[]> => {
  try {
    // No token needed for this public route
    const response = await axios.get<Destination[]>(`${API_URL}/available`);
    console.log("Raw API response:", response);
    console.log("Response data:", response.data);
    console.log("Response data type:", typeof response.data);
    console.log("Is array?", Array.isArray(response.data));

    if (!Array.isArray(response.data)) {
      console.error("Server returned non-array data:", response.data);
      throw new Error("Server returned invalid data format");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching available destinations:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error response:", error.response);
      console.error("Axios error config:", error.config);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch available destinations"
      );
    }
    throw new Error(
      "Failed to fetch available destinations due to an unexpected error."
    );
  }
};
