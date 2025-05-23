import axios from "axios";

// Define the base URL for your backend API
// Make sure your backend is running and accessible at this URL
const API_BASE_URL = "http://localhost:3001/api"; // Adjust if your backend port is different

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define interfaces for the expected data structures
// These should match your Mongoose schemas on the backend

export interface Destination {
  _id: string; // MongoDB typically uses _id
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  // Add any other fields your Destination model has
}

export interface Minibus {
  _id: string;
  name: string;
  capacity: number;
  features?: string[];
  imageUrl?: string;
  // Add any other fields your Minibus model has
}

// API functions
export const getDestinations = async (): Promise<Destination[]> => {
  try {
    const response = await apiClient.get("/destinations");
    return response.data;
  } catch (error) {
    console.error("Error fetching destinations:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getMinibuses = async (): Promise<Minibus[]> => {
  try {
    const response = await apiClient.get("/minibuses");
    return response.data;
  } catch (error) {
    console.error("Error fetching minibuses:", error);
    throw error;
  }
};

// Add other API functions as needed (e.g., getDestinationById, createBooking, etc.)
// For now, getDestinations and getMinibuses are sufficient for this step.

export interface BookingPayload {
  destinationId: string;
  minibusId: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string; // ISO string date e.g., YYYY-MM-DD
}

export interface BookingResponse {
  // Assuming backend returns the created booking
  _id: string;
  destination: Destination | string; // Could be populated or just ID
  minibus: Minibus | string; // Could be populated or just ID
  customerName: string;
  customerEmail: string;
  bookingDate: string; // Or Date
  status: "pending" | "confirmed" | "cancelled";
  // Add any other fields your backend Booking model returns
}

export const createBooking = async (
  bookingData: BookingPayload
): Promise<{ message: string; booking: BookingResponse }> => {
  try {
    const response = await apiClient.post("/bookings", bookingData);
    return response.data; // Expect { message: '...', booking: {...} }
  } catch (error: any) {
    // Explicitly type error
    console.error(
      "Error creating booking:",
      error.response?.data?.message || error.message
    );
    // Throw a more specific error message if available from backend, else generic
    throw new Error(
      error.response?.data?.message || "Failed to create booking."
    );
  }
};
