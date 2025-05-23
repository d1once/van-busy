import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/useAuth"; // Import useAuth

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to homepage after logout
  };

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
            {/* Public destinations link still makes sense */}
            <Button variant="ghost" asChild>
              <Link to="/destinations">Destinations</Link>
            </Button>
            {/* Public minibuses link if it's a generic info page */}
            {/* <Button variant="ghost" asChild>
              <Link to="/minibuses">Minibuses</Link>
            </Button> */}

            {isAuthenticated ? (
              <>
                {user?.role === "user" && (
                  <Button variant="ghost" asChild>
                    {/* This route /my-bookings was created in a previous subtask */}
                    <Link to="/my-bookings">My Bookings</Link>
                  </Button>
                )}
                {user?.role === "admin" && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
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
        © {new Date().getFullYear()} Minibus Booking Services. All rights
        reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
