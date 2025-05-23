// minibus-booking-platform/frontend/src/components/booking/BookingModal.tsx
import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Destination } from "../../services/destinationService";
import { getPublicMinibuses } from "../../services/minibusService";
import type { Minibus } from "../../services/minibusService";
import { createBooking as apiCreateBooking } from "../../services/bookingService";
import type { CreateBookingData } from "../../services/bookingService";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker"; // Assuming DatePicker is adapted for general use
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../../contexts/useAuth"; // To get user ID for booking (backend derives from token)
import { useNavigate } from "react-router-dom";
import "./BookingModal.css"; // We'll create this CSS file

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  destination,
}) => {
  const [selectedMinibusId, setSelectedMinibusId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
  const [availableMinibuses, setAvailableMinibuses] = useState<Minibus[]>([]);
  const [isLoadingMinibuses, setIsLoadingMinibuses] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      setSelectedMinibusId("");
      setBookingDate(new Date()); // Default to today
      setError(null);
      setSuccessMessage(null);

      const fetchMinibuses = async () => {
        setIsLoadingMinibuses(true);
        try {
          const minibuses = await getPublicMinibuses();
          // Filter for active minibuses if not done by backend
          setAvailableMinibuses(minibuses.filter((m) => m.status === "active"));
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load available minibuses."
          );
        } finally {
          setIsLoadingMinibuses(false);
        }
      };
      fetchMinibuses();
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!destination) {
      setError("No destination selected.");
      return;
    }
    if (!selectedMinibusId) {
      setError("Please select a minibus.");
      return;
    }
    if (!bookingDate) {
      setError("Please select a booking date.");
      return;
    }

    setIsSubmitting(true);
    const bookingData: CreateBookingData = {
      destinationId: destination._id,
      minibusId: selectedMinibusId,
      bookingDate: bookingDate.toISOString(), // Send date in ISO format
    };

    try {
      // createBooking from bookingService handles auth token internally
      await apiCreateBooking(bookingData);
      // The backend returns { message, booking }, we only need message for success
      // If the response structure is just Booking, adjust accordingly
      setSuccessMessage("Booking successful! Redirecting to your bookings...");
      setTimeout(() => {
        onClose(); // Close modal
        navigate("/my-bookings"); // Redirect to user's bookings page
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !destination) return null;

  return (
    <div className="modal-overlay booking-modal-overlay">
      <div className="modal-content booking-modal-content">
        <h2>Book Your Trip to {destination.name}</h2>
        {error && <p className="error-message modal-error">{error}</p>}
        {successMessage && (
          <p className="success-message modal-success">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination:</label>
            <p>
              {destination.name} - ${destination.price.toFixed(2)}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="minibus-select">Select Minibus:</label>
            {isLoadingMinibuses ? (
              <p>Loading minibuses...</p>
            ) : availableMinibuses.length > 0 ? (
              <Select
                value={selectedMinibusId}
                onValueChange={setSelectedMinibusId}
                required
              >
                <SelectTrigger id="minibus-select">
                  <SelectValue placeholder="Choose a minibus" />
                </SelectTrigger>
                <SelectContent>
                  {availableMinibuses.map((minibus) => (
                    <SelectItem key={minibus._id} value={minibus._id}>
                      {minibus.name} (Capacity: {minibus.capacity}, Plate:{" "}
                      {minibus.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>No minibuses currently available.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="booking-date">Select Booking Date:</label>
            <DatePicker date={bookingDate} setDate={setBookingDate} />
            {/* Ensure DatePicker is correctly implemented to work with ShadCN's Popover and Calendar */}
          </div>

          <div className="form-group">
            <label>Number of Seats:</label>
            <p>1 (Currently fixed)</p>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              className="submit-button"
              disabled={
                isSubmitting ||
                isLoadingMinibuses ||
                availableMinibuses.length === 0
              }
            >
              {isSubmitting ? "Processing Booking..." : "Confirm Booking"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
