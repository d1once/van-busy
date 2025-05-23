// minibus-booking-platform/frontend/src/components/admin/AdminLayout.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './AdminLayout.css'; // We'll create this CSS file next

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/minibuses">Minibus Management</Link></li>
            <li><Link to="/admin/destinations">Destination Management</Link></li>
            <li><Link to="/admin/bookings">Booking Management</Link></li>
            {/* Add more admin links as needed */}
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet /> {/* This is where the routed admin pages will render */}
      </main>
    </div>
  );
};

export default AdminLayout;
