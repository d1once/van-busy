// minibus-booking-platform/frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  login as apiLogin, // Renamed from apiLoginAdmin
  logout as apiLogout, // Renamed from apiLogoutAdmin
  getCurrentUser, 
  getAuthToken, // Renamed from getAdminToken
  AdminUser, 
  AuthResponse 
} from '../services/authService';
import { apiClient } from '../services/api'; // To update apiClient headers

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth state loading
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    // Check for existing user and token on initial load
    const initializeAuth = () => {
      setIsLoading(true);
      const currentUser = getCurrentUser();
      const token = getAuthToken(); // Use renamed getter

      if (currentUser && token) {
        setUser(currentUser);
        setIsAuthenticated(true);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const authResponse: AuthResponse = await apiLogin(credentials); // Use renamed apiLogin
      if (authResponse.user && authResponse.token) {
        setUser(authResponse.user);
        setIsAuthenticated(true);
        // authService.login already sets token in localStorage and apiClient
      } else {
        throw new Error('Login response missing user or token.');
      }
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      // Ensure state is reset on failed login
      setUser(null);
      setIsAuthenticated(false);
      delete apiClient.defaults.headers.common['Authorization']; // Ensure header is cleared
      throw error; 
    }
  };

  const logout = () => {
    apiLogout(); // Use renamed apiLogout
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
