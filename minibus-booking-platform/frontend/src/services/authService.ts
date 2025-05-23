// src/services/authService.ts
import { apiClient } from "./api"; // Use the existing apiClient

const API_BASE_URL = "http://localhost:3001/api/auth"; // Adjust if needed

export interface AdminUser {
  _id: string;
  username: string;
  isAdmin: boolean;
  // Add other relevant fields from your User model if needed
}

export interface AuthResponse {
  token: string;
  user: AdminUser; // Assuming your login endpoint returns user details
}

const USER_KEY = "admin_user";
const TOKEN_KEY = "admin_token";

export const loginAdmin = async (credentials: any): Promise<AuthResponse> => {
  try {
    // Use the global apiClient for consistency if it's already configured for the base URL
    // Or create a new axios instance specifically for auth if preferred.
    // For this example, assuming /api/auth/login is the endpoint
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    if (response.data.token && response.data.user) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      // Set token in apiClient for subsequent requests
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error: any) {
    console.error(
      "Admin login failed:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Remove token from apiClient
  delete apiClient.defaults.headers.common["Authorization"];
};

export const getCurrentAdmin = (): AdminUser | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const getAdminToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Function to initialize apiClient with token on app load
export const initializeAuthHeader = () => {
  const token = getAdminToken();
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
