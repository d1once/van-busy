import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout'; // Import AdminLayout
import HomePage from '@/pages/HomePage';
import DestinationsPage from '@/pages/DestinationsPage';
import MinibusesPage from '@/pages/MinibusesPage';
import BookingPage from '@/pages/BookingPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { initializeAuthHeader } from '@/services/authService'; // Import

// Initialize Auth Header on App Load
initializeAuthHeader();

// Placeholder Admin Pages (can be moved to src/pages/admin/ later)
const AdminDashboardPage = () => <div className="p-4"><h1 className="text-xl font-bold">Admin Dashboard</h1><p>Content TBD</p></div>;
const AdminManageMinibusesPage = () => <div className="p-4"><h1 className="text-xl font-bold">Manage Minibuses</h1><p>Content TBD</p></div>;
const AdminManageDestinationsPage = () => <div className="p-4"><h1 className="text-xl font-bold">Manage Destinations</h1><p>Content TBD</p></div>;
const AdminManageBookingsPage = () => <div className="p-4"><h1 className="text-xl font-bold">Manage Bookings</h1><p>Content TBD</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="minibuses" element={<MinibusesPage />} />
          <Route path="book" element={<BookingPage />} />
          {/* Keep AdminLoginPage accessible outside AdminLayout for initial login - handled below */}
        </Route>

        {/* Admin Login Page (Separate from AdminLayout to avoid recursive redirect) */}
        {/* This route is defined to be outside the MainLayout styling for login page */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="minibuses" element={<AdminManageMinibusesPage />} />
          <Route path="destinations" element={<AdminManageDestinationsPage />} />
          <Route path="bookings" element={<AdminManageBookingsPage />} />
          {/* Redirect to dashboard if /admin is hit directly or any other sub-route not matched */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} /> {/* Catch-all for /admin/* */}
        </Route>

        {/* Not Found Route - ensure it's structured to show within MainLayout or a specific 404 layout */}
        {/* This catch-all should ideally be part of MainLayout or a dedicated NotFoundLayout */}
        <Route path="*" element={
          <MainLayout>
            <NotFoundPage />
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
