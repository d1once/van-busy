// minibus-booking-platform/frontend/src/services/minibusService.ts
import axios from 'axios';

const API_URL = '/api/minibuses'; // Adjust if your API URL is different

// Function to get the auth token for admin-specific actions
const getAdminAuthToken = (): string | null => {
  // This should use the same token key as defined in authService.ts for consistency
  // if admins and users share the same token, or a specific adminToken if they are different.
  // Corrected to use 'authToken' as per previous service updates.
  return localStorage.getItem('authToken'); 
};

// Interface for Minibus (already defined, ensure it's suitable)
export interface Minibus { // Added export to be reusable by other components like BookingModal
  _id: string;
  name: string;
  capacity: number;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'out of service';
  features?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getMinibuses = async (): Promise<Minibus[]> => {
  try {
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: ``, // Default to empty string
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Handle cases where the token is not available for an admin-protected route
      // This might involve redirecting to login or showing an error
      // For now, we'll log a warning, but the API call might fail if unprotected
      console.warn('Admin token not found. API call might fail if route is protected.');
      // Depending on backend setup, if no token is provided for a protected route,
      // the request will likely be rejected.
      // If the /api/minibuses is public for GET, this will still work.
      // However, the task implies this is for an admin section, so token should be present.
    }
    
    const response = await axios.get<Minibus[]>(API_URL, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching minibuses:', error);
    if (axios.isAxiosError(error) && error.response) {
      // Log more detailed error information if available
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(error.response.data.message || 'Failed to fetch minibuses');
    }
    throw new Error('Failed to fetch minibuses due to an unexpected error.');
  }
};

// Get all publicly available minibuses (e.g., status 'active')
// This assumes the backend has a public endpoint or the main /api/minibuses is public for GET
export const getPublicMinibuses = async (): Promise<Minibus[]> => {
  try {
    // No token needed for public data
    // If backend filters by status (e.g. /api/minibuses?status=active), adjust URL
    const response = await axios.get<Minibus[]>(API_URL); 
    // Frontend filter if backend doesn't: return response.data.filter(m => m.status === 'active');
    return response.data;
  } catch (error) {
    console.error('Error fetching public minibuses:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch public minibuses');
    }
    throw new Error('Failed to fetch public minibuses due to an unexpected error.');
  }
};

// Type for minibus data when creating (ID is not yet assigned by DB)
export type MinibusData = Omit<Minibus, '_id' | 'createdAt' | 'updatedAt'>;
// Type for minibus data when updating (ID is known, some fields optional)
export type MinibusUpdateData = Partial<MinibusData>;


export const createMinibus = async (minibusData: MinibusData): Promise<Minibus> => {
  try {
    const token = getAdminAuthToken(); // Use corrected admin token getter
    if (!token) {
      throw new Error('Admin token not found. Cannot create minibus.');
    }
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post<Minibus>(API_URL, minibusData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating minibus:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to create minibus');
    }
    throw new Error('Failed to create minibus due to an unexpected error.');
  }
};

export const updateMinibus = async (id: string, minibusData: MinibusUpdateData): Promise<Minibus> => {
  try {
    const token = getAdminAuthToken(); // Use corrected admin token getter
    if (!token) {
      throw new Error('Admin token not found. Cannot update minibus.');
    }
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.put<Minibus>(`${API_URL}/${id}`, minibusData, config);
    return response.data;
  } catch (error) {
    console.error(`Error updating minibus with ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update minibus');
    }
    throw new Error('Failed to update minibus due to an unexpected error.');
  }
};

export const deleteMinibus = async (id: string): Promise<{ message: string }> => {
  try {
    const token = getAdminAuthToken(); // Use corrected admin token getter
    if (!token) {
      throw new Error('Admin token not found. Cannot delete minibus.');
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.delete<{ message: string }>(`${API_URL}/${id}`, config);
    return response.data; // Expecting a response like { message: "Minibus removed" }
  } catch (error) {
    console.error(`Error deleting minibus with ID ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to delete minibus');
    }
    throw new Error('Failed to delete minibus due to an unexpected error.');
  }
};
