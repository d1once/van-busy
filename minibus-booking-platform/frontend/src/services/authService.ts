// src/services/authService.ts
import { apiClient } from "./api"; // Use the existing apiClient

const API_BASE_URL = "http://localhost:3001/api/auth"; // Adjust if needed

export interface AdminUser { // Updated interface
  _id: string;
  username: string;
  role: 'admin' | 'user'; // Using role as per backend updates
  email?: string; // Optional: if backend provides it
  // Add other relevant fields from your User model if needed
}

export interface AuthResponse {
  token: string;
  user: AdminUser; 
}

const USER_KEY = "authUser"; 
const TOKEN_KEY = "authToken"; // Generalized token key

// User Registration
export interface UserRegistrationData {
  username: string;
  email?: string; // Assuming email might be part of registration
  password?: string;
}

export interface RegistrationResponse {
  message: string;
  user?: AdminUser; // Backend might return the created user (without token)
}

export const registerUser = async (userData: UserRegistrationData): Promise<RegistrationResponse> => {
  try {
    // Assuming the backend registration endpoint is /api/auth/register
    const response = await apiClient.post<RegistrationResponse>("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    console.error(
      "User registration failed:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

// Generic Login (for both User and Admin, role in response will differentiate)
export const login = async (credentials: any): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login", // Same endpoint for user and admin login
      credentials
    );
    if (response.data.token && response.data.user) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error: any) {
    console.error(
      "Login failed:", // Generalized error message
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const logout = () => { // Renamed for generality
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete apiClient.defaults.headers.common["Authorization"];
};

export const getCurrentUser = (): AdminUser | null => { 
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.role) { // Basic validation
        return user as AdminUser;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    localStorage.removeItem(USER_KEY); // Clear invalid/corrupted stored user
    return null;
  }
  return null;
};

export const getAuthToken = (): string | null => { // Renamed for generality
  return localStorage.getItem(TOKEN_KEY);
};

// Function to initialize apiClient with token on app load
export const initializeAuthHeader = () => {
  const token = getAuthToken(); // Use generalized getter
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
