import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout"; // Updated AdminLayout path
import HomePage from "@/pages/HomePage";
import DestinationsPage from "@/pages/DestinationsPage";
import MinibusesPage from "@/pages/MinibusesPage";
import BookingPage from "@/pages/BookingPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { initializeAuthHeader } from "@/services/authService";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import UserProtectedRoute from "@/components/auth/UserProtectedRoute"; // Import UserProtectedRoute

// Import actual admin pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import MinibusManagementPage from "@/pages/admin/MinibusManagementPage";
import DestinationManagementPage from "@/pages/admin/DestinationManagementPage";
import BookingManagementPage from "@/pages/admin/BookingManagementPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import UserBookingsPage from "@/pages/UserBookingsPage"; // Import UserBookingsPage

// Initialize Auth Header on App Load
initializeAuthHeader();

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes & User Auth Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="minibuses" element={<MinibusesPage />} />
          <Route path="book" element={<BookingPage />} />
          {/* Protected route for user's bookings */}
          <Route element={<UserProtectedRoute />}>
            <Route path="my-bookings" element={<UserBookingsPage />} />
          </Route>
        </Route>

        {/* Admin Login Page (Separate from AdminLayout and MainLayout) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="minibuses" element={<MinibusManagementPage />} />
            <Route
              path="destinations"
              element={<DestinationManagementPage />}
            />
            <Route path="bookings" element={<BookingManagementPage />} />
            {/* Redirect to dashboard if /admin is hit directly */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            {/* Optional: A more specific catch-all for /admin sub-routes not found,
                 if AdminLayout should render a 404 page within its structure.
                 Otherwise, the global catch-all will handle it.
                 For now, let's assume if /admin/nonexistent is hit, it should redirect to /admin/dashboard.
            */}
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Route>
        </Route>

        {/* Not Found Route - ensure it's structured to show within MainLayout or a specific 404 layout */}
        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
