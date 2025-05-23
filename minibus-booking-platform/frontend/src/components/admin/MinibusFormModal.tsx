// minibus-booking-platform/frontend/src/components/admin/MinibusFormModal.tsx
import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
  MinibusData,
  MinibusUpdateData,
} from "../../services/minibusService";
import "./MinibusFormModal.css";

interface Minibus {
  _id: string;
  name: string;
  capacity: number;
  licensePlate: string;
  status: "active" | "maintenance" | "out of service";
  features?: string[];
  imageUrl?: string;
}

interface MinibusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (minibusData: MinibusData | MinibusUpdateData) => void;
  minibusToEdit?: Minibus | null; // Pass minibus data if editing
  isLoading?: boolean;
  error?: string | null;
}

const MinibusFormModal: React.FC<MinibusFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  minibusToEdit,
  isLoading,
  error: submissionError,
}) => {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [licensePlate, setLicensePlate] = useState("");
  const [status, setStatus] = useState<
    "active" | "maintenance" | "out of service"
  >("active");
  const [features, setFeatures] = useState(""); // Comma-separated string
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (minibusToEdit) {
      setName(minibusToEdit.name);
      setCapacity(minibusToEdit.capacity);
      setLicensePlate(minibusToEdit.licensePlate);
      setStatus(minibusToEdit.status);
      setFeatures(minibusToEdit.features?.join(", ") || "");
      setImageUrl(minibusToEdit.imageUrl || "");
    } else {
      // Reset form for "Add New"
      setName("");
      setCapacity("");
      setLicensePlate("");
      setStatus("active");
      setFeatures("");
      setImageUrl("");
    }
    setFormError(null); // Clear previous form errors when minibusToEdit changes or modal opens
  }, [isOpen, minibusToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    if (!name || capacity === "" || !licensePlate) {
      setFormError("Name, Capacity, and License Plate are required.");
      return;
    }
    if (capacity <= 0) {
      setFormError("Capacity must be a positive number.");
      return;
    }

    const minibusData: MinibusData | MinibusUpdateData = {
      name,
      capacity: Number(capacity),
      licensePlate,
      status,
      features: features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f), // Handle empty strings from split
      imageUrl: imageUrl || undefined, // Send undefined if empty to potentially clear it
    };

    onSubmit(minibusData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{minibusToEdit ? "Edit Minibus" : "Add New Minibus"}</h2>
        {formError && <p className="error-message form-error">{formError}</p>}
        {submissionError && (
          <p className="error-message submission-error">{submissionError}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="licensePlate">License Plate:</label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="capacity">Capacity:</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) =>
                setCapacity(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
              min="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              required
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="out of service">Out of Service</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="features">Features (comma-separated):</label>
            <input
              type="text"
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL:</label>
            <input
              type="text"
              id="imageUrl"
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
                ? minibusToEdit
                  ? "Saving..."
                  : "Adding..."
                : minibusToEdit
                ? "Save Changes"
                : "Add Minibus"}
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

export default MinibusFormModal;
