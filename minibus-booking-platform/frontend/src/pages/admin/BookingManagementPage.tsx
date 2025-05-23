// minibus-booking-platform/frontend/src/pages/admin/BookingManagementPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  getAllBookingsAdmin, 
  cancelBookingAdmin, 
  Booking 
} from '../../services/bookingService';
import './BookingManagementPage.css'; // We'll create this CSS file

const BookingManagementPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null); // Store ID of booking being cancelled

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllBookingsAdmin();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error("Error in fetchBookings:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsCancelling(bookingId);
      setError(null); // Clear previous errors
      try {
        await cancelBookingAdmin(bookingId);
        // Refresh the list or update the specific booking's status locally
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b._id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
        // alert('Booking cancelled successfully'); // Or use a more sophisticated notification
      } catch (err) {
        console.error(`Error cancelling booking ${bookingId}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to cancel booking.');
        // alert(`Error: ${err instanceof Error ? err.message : 'Failed to cancel booking.'}`);
      } finally {
        setIsCancelling(null);
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
      // hour: '2-digit', minute: '2-digit' // Uncomment if time is relevant
    });
  };

  return (
    <div className="booking-management-page">
      <header className="page-header">
        <h1>Booking Management</h1>
        {/* Add filters or search if needed in future */}
      </header>

      {isLoading && <p>Loading bookings...</p>}
      {error && <p className="error-message page-error">{error}</p>}
      
      {!isLoading && !error && bookings.length === 0 && (
        <p>No bookings found.</p>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Minibus</th>
              <th>Destination</th>
              <th>Booking Date</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const user = typeof booking.user === 'object' ? booking.user : null;
              const minibus = typeof booking.minibus === 'object' ? booking.minibus : null;
              const destination = typeof booking.destination === 'object' ? booking.destination : null;

              return (
                <tr key={booking._id}>
                  <td>{user ? user.username : 'N/A'} <br/> <small>{user ? user.email : ''}</small></td>
                  <td>{minibus ? minibus.name : 'N/A'} <br/> <small>{minibus ? minibus.licensePlate : ''}</small></td>
                  <td>{destination ? destination.name : 'N/A'}</td>
                  <td>{formatDate(booking.bookingDate)}</td>
                  <td>${destination && destination.price ? destination.price.toFixed(2) : 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status !== 'cancelled' && (
                      <button 
                        className="action-button cancel-button" 
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={isCancelling === booking._id}
                      >
                        {isCancelling === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingManagementPage;
