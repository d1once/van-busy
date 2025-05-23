// minibus-booking-platform/frontend/src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAvailableDestinations } from "../services/destinationService";
import type { Destination } from "../services/destinationService";
import { useAuth } from "../contexts/useAuth"; // Import useAuth
import BookingModal from "../components/booking/BookingModal"; // Import BookingModal
import "./HomePage.css";

const HomePage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      try {
        const data = await getAvailableDestinations();
        console.log("Received destinations data:", data); // Debug log
        if (!Array.isArray(data)) {
          console.error("Expected array but received:", typeof data);
          throw new Error("Invalid data format received from server");
        }
        setDestinations(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching available destinations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load destinations."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleBookNowClick = (destination: Destination) => {
    if (!isAuthenticated) {
      // Redirect to login, saving current location to come back to
      // or more specifically, to re-trigger the booking modal for this destination.
      navigate("/login", {
        state: {
          from: location,
          action: "book",
          destinationId: destination._id,
        },
      });
    } else {
      setSelectedDestination(destination);
      setIsBookingModalOpen(true);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDestination(null);
  };

  // Effect to potentially re-open modal after login
  useEffect(() => {
    if (
      isAuthenticated &&
      location.state?.action === "book" &&
      location.state?.destinationId
    ) {
      const destId = location.state.destinationId;
      const destToBook = destinations.find((d) => d._id === destId);
      if (destToBook) {
        // Clear the state to prevent re-opening on every navigation
        navigate(location.pathname, { replace: true, state: {} });
        setSelectedDestination(destToBook);
        setIsBookingModalOpen(true);
      }
    }
  }, [
    isAuthenticated,
    location.state,
    destinations,
    navigate,
    location.pathname,
  ]);

  if (isLoading) {
    return (
      <div className="loading-message">Loading available destinations...</div>
    );
  }

  if (error) {
    return <div className="error-message page-error">Error: {error}</div>;
  }

  if (destinations.length === 0) {
    return (
      <div className="no-destinations-message">
        No available destinations at the moment. Please check back later!
      </div>
    );
  }

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Explore Our Destinations</h1>
        <p>Find the perfect trip for your next adventure.</p>
      </header>
      <div className="destinations-grid">
        {destinations.map((destination) => (
          <div key={destination._id} className="destination-card">
            <img
              src={
                destination.imageUrl ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={destination.name}
              className="destination-image"
            />
            <div className="destination-info">
              <h3>{destination.name}</h3>
              <p className="destination-location">{destination.location}</p>
              <p className="destination-description">
                {destination.description}
              </p>
              <p className="destination-price">
                ${destination.price.toFixed(2)}
              </p>
              <button
                className="book-now-button"
                onClick={() => handleBookNowClick(destination)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedDestination && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          destination={selectedDestination}
        />
      )}
    </div>
  );
};

export default HomePage;
