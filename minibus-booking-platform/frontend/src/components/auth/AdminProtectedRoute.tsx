// minibus-booking-platform/frontend/src/components/auth/AdminProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth"; // Adjust path if necessary

const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or a blank page while auth state is being determined
    // This is crucial to prevent redirect flashes before auth is checked
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    // Pass the current location to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    // User is authenticated but not an admin
    // Redirect to a "Not Authorized" page or homepage.
    // For simplicity, redirecting to homepage. A dedicated /unauthorized page might be better.
    alert("You are not authorized to access this page."); // Simple feedback
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin, render the requested admin content
  return <Outlet />;
  // If you were to pass children: return <>{children}</>;
};

export default AdminProtectedRoute;
