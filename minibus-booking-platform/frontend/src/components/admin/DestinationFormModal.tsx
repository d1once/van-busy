// minibus-booking-platform/frontend/src/components/admin/DestinationFormModal.tsx
import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
  Destination,
  DestinationData,
  DestinationUpdateData,
} from "../../services/destinationService";
import "./MinibusFormModal.css"; // Reuse existing modal CSS if structure is similar or create a new one

interface DestinationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DestinationData | DestinationUpdateData) => void;
  destinationToEdit?: Destination | null;
  isLoading?: boolean;
  error?: string | null;
}

const DestinationFormModal: React.FC<DestinationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  destinationToEdit,
  isLoading,
  error: submissionError,
}) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [status, setStatus] = useState<"available" | "unavailable">(
    "available"
  );
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (destinationToEdit) {
      setName(destinationToEdit.name);
      setLocation(destinationToEdit.location);
      setDescription(destinationToEdit.description);
      setPrice(destinationToEdit.price);
      setStatus(destinationToEdit.status);
      setImageUrl(destinationToEdit.imageUrl || "");
    } else {
      setName("");
      setLocation("");
      setDescription("");
      setPrice("");
      setStatus("available");
      setImageUrl("");
    }
    setFormError(null);
  }, [isOpen, destinationToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !location || !description || price === "") {
      setFormError("Name, Location, Description, and Price are required.");
      return;
    }
    if (price < 0) {
      setFormError("Price cannot be negative.");
      return;
    }

    const destinationData: DestinationData | DestinationUpdateData = {
      name,
      location,
      description,
      price: Number(price),
      status,
      imageUrl: imageUrl || undefined,
    };
    onSubmit(destinationData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          {destinationToEdit ? "Edit Destination" : "Add New Destination"}
        </h2>
        {formError && <p className="error-message form-error">{formError}</p>}
        {submissionError && (
          <p className="error-message submission-error">{submissionError}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dest-name">Name:</label>
            <input
              type="text"
              id="dest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dest-location">Location:</label>
            <input
              type="text"
              id="dest-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dest-description">Description:</label>
            <textarea
              id="dest-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dest-price">Price:</label>
            <input
              type="number"
              id="dest-price"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dest-status">Status:</label>
            <select
              id="dest-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              required
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dest-imageUrl">Image URL:</label>
            <input
              type="text"
              id="dest-imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading
                ? destinationToEdit
                  ? "Saving..."
                  : "Adding..."
                : destinationToEdit
                ? "Save Changes"
                : "Add Destination"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DestinationFormModal;
