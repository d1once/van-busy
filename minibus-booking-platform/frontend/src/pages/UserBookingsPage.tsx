// minibus-booking-platform/frontend/src/pages/UserBookingsPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { getMyBookings } from "../services/bookingService";
import type { Booking } from "../services/bookingService";
import "./UserBookingsPage.css"; // We'll create this CSS file

const UserBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch your bookings."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div className="loading-message">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="error-message page-error">Error: {error}</div>;
  }

  return (
    <div className="user-bookings-page-container">
      <header className="page-header">
        <h1>My Bookings</h1>
      </header>

      {bookings.length === 0 && !isLoading && (
        <p className="no-bookings-message">You have no bookings yet.</p>
      )}

      {bookings.length > 0 && (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const minibus =
              typeof booking.minibus === "object" ? booking.minibus : null;
            const destination =
              typeof booking.destination === "object"
                ? booking.destination
                : null;
            // Assuming 1 seat per booking as per current model
            const numberOfSeats = 1;
            const totalPrice = destination?.price
              ? destination.price * numberOfSeats
              : "N/A";

            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <h3>{destination ? destination.name : "N/A"}</h3>
                  <span
                    className={`status-badge status-${booking.status.toLowerCase()}`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="booking-card-body">
                  <p>
                    <strong>Minibus:</strong> {minibus ? minibus.name : "N/A"} (
                    {minibus ? minibus.licensePlate : "N/A"})
                  </p>
                  <p>
                    <strong>Booking Date:</strong>{" "}
                    {formatDate(booking.bookingDate)}
                  </p>
                  <p>
                    <strong>Seats:</strong> {numberOfSeats}
                  </p>
                  <p>
                    <strong>Total Price:</strong> $
                    {typeof totalPrice === "number"
                      ? totalPrice.toFixed(2)
                      : totalPrice}
                  </p>
                  <p>
                    <strong>Status:</strong> {booking.status}
                  </p>
                  {/* Add Cancel button here if implementing cancellation */}
                  {/* {booking.status !== 'cancelled' && (
                    <button 
                      className="action-button cancel-my-booking-button" 
                      // onClick={() => handleCancelOwnBooking(booking._id)}
                    >
                      Cancel Booking
                    </button>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;
