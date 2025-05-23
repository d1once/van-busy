import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Using existing button

const Navbar: React.FC = () => {
  return (
    <nav className="bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-lg font-semibold text-primary">
            MinibusBookings
          </Link>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/destinations">Destinations</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/minibuses">Minibuses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> {/* Child routes will render here */}
      </main>
      <footer className="bg-card border-t py-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Minibus Booking Services. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
