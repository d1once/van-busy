// minibus-booking-platform/frontend/src/services/bookingService.ts
import axios from 'axios';

const API_BASE_URL = '/api/bookings'; // Base URL for booking routes

// Function to get the auth token (should be consistent with other services)
// This should use the same token key as defined in authService.ts
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken'); // Corrected to use general 'authToken'
};

// Interface for User (adjust based on actual User model fields you need)
interface User {
  _id: string;
  username: string;
  email?: string; 
}

// Interface for Minibus (adjust based on actual Minibus model fields you need)
interface Minibus {
  _id: string;
  name: string;
  licensePlate: string;
  capacity?: number;
}

// Interface for Destination (adjust based on actual Destination model fields you need)
interface Destination {
  _id: string;
  name: string;
  location?: string;
  price?: number;
}

export interface Booking {
  _id: string;
  user: User | string; // Can be populated User object or just userId string
  minibus: Minibus | string;
  destination: Destination | string;
  bookingDate: string; // Or Date
  status: 'pending' | 'confirmed' | 'cancelled';
  // customerName and customerEmail are not used if 'user' is populated
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all bookings for admin
export const getAllBookingsAdmin = async (): Promise<Booking[]> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Admin token not found. Cannot fetch all bookings.');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get<Booking[]>(`${API_BASE_URL}/admin/all`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings for admin:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch all bookings');
    }
    throw new Error('Failed to fetch all bookings due to an unexpected error.');
  }
};

// Cancel a booking (Admin)
export const cancelBookingAdmin = async (bookingId: string): Promise<{ message: string; booking: Booking }> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Admin token not found. Cannot cancel booking.');

    const config = {
      headers: {
        'Content-Type': 'application/json', // Though no body, good practice for PUT
        Authorization: `Bearer ${token}`,
      },
    };
    // The backend route is PUT /api/bookings/admin/cancel/:id
    const response = await axios.put<{ message: string; booking: Booking }>(
      `${API_BASE_URL}/admin/cancel/${bookingId}`, 
      {}, // Empty body for this PUT request as per backend controller
      config
    );
    return response.data;
  } catch (error) {
    console.error(`Error cancelling booking with ID ${bookingId} for admin:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to cancel booking');
    }
    throw new Error('Failed to cancel booking due to an unexpected error.');
  }
};

// NOTE: User-specific booking functions (createBooking, getMyBookings) would also go here
// but are not part of this specific admin-focused subtask's service creation.
// If they exist in another service, that's fine. If not, they could be added here for completeness.
// For example:
// export const createBooking = async (bookingData: { destinationId: string, minibusId: string, bookingDate: string }) => { ... }

// Fetch bookings for the authenticated user
export const getMyBookings = async (): Promise<Booking[]> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated. Cannot fetch bookings.');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    // The backend route is GET /api/bookings/my-bookings
    const response = await axios.get<Booking[]>(`${API_BASE_URL}/my-bookings`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch your bookings');
    }
    throw new Error('Failed to fetch your bookings due to an unexpected error.');
  }
};

// Interface for data needed to create a booking
export interface CreateBookingData {
  destinationId: string;
  minibusId: string;
  bookingDate: string; // ISO string format recommended
  // seats: number; // Not currently supported by backend model, implicitly 1
}

// Create a new booking
export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated. Cannot create booking.');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    // The backend route is POST /api/bookings
    const response = await axios.post<Booking>(API_BASE_URL, bookingData, config);
    return response.data; // Backend currently returns { message, booking }
                          // but for consistency let's assume it might return just Booking or we adapt
  } catch (error) {
    console.error('Error creating booking:', error);
    if (axios.isAxiosError(error) && error.response) {
      // The backend might send { message: '...', booking: ... } or just { message: '...' }
      // error.response.data could be { message: "Minibus not available on this date." }
      throw new Error(error.response.data.message || 'Failed to create booking');
    }
    throw new Error('Failed to create booking due to an unexpected error.');
  }
};
