import React from 'react';
import { Outlet, Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentAdmin, logoutAdmin } from '@/services/authService';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const adminUser = getCurrentAdmin();

  if (!adminUser || !adminUser.isAdmin) {
    // If not logged in or not an admin, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-slate-100 p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
        <Button variant="ghost" className="w-full justify-start hover:bg-slate-700" asChild>
          <Link to="/admin/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-slate-700" asChild>
          <Link to="/admin/minibuses">Manage Minibuses</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-slate-700" asChild>
          <Link to="/admin/destinations">Manage Destinations</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start hover:bg-slate-700" asChild>
          <Link to="/admin/bookings">Manage Bookings</Link>
        </Button>
        <Button variant="destructive" className="w-full mt-auto" onClick={handleLogout}>
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 bg-slate-50">
        <Outlet /> {/* Admin child routes will render here */}
      </main>
    </div>
  );
};

export default AdminLayout;
