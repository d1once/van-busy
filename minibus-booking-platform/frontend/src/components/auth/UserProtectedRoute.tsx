// minibus-booking-platform/frontend/src/components/auth/UserProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth"; // Adjust path if necessary

const UserProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or a blank page while auth state is being determined
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the requested content
  return <Outlet />;
};

export default UserProtectedRoute;
