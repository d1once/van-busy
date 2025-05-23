// minibus-booking-platform/frontend/src/pages/admin/MinibusManagementPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getMinibuses,
  createMinibus,
  updateMinibus,
  deleteMinibus,
} from "../../services/minibusService";
import type {
  MinibusData,
  MinibusUpdateData,
} from "../../services/minibusService";
import MinibusFormModal from "../../components/admin/MinibusFormModal";
import "./MinibusManagementPage.css";

interface Minibus {
  _id: string;
  name: string;
  capacity: number;
  licensePlate: string;
  status: "active" | "maintenance" | "out of service";
  features?: string[];
  imageUrl?: string;
}

const MinibusManagementPage: React.FC = () => {
  const [minibuses, setMinibuses] = useState<Minibus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For table loading
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submission
  const [error, setError] = useState<string | null>(null); // For general page errors
  const [formError, setFormError] = useState<string | null>(null); // For form/modal errors

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [minibusToEdit, setMinibusToEdit] = useState<Minibus | null>(null);

  const fetchMinibuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMinibuses();
      setMinibuses(data);
      setError(null);
    } catch (err) {
      console.error("Error in fetchMinibuses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch minibuses"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMinibuses();
  }, [fetchMinibuses]);

  const handleOpenModalForAdd = () => {
    setMinibusToEdit(null);
    setFormError(null); // Clear previous form errors
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (minibus: Minibus) => {
    setMinibusToEdit(minibus);
    setFormError(null); // Clear previous form errors
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMinibusToEdit(null);
    setFormError(null); // Also clear form errors on close
  };

  const handleSubmitMinibus = async (data: MinibusData | MinibusUpdateData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (minibusToEdit) {
        await updateMinibus(minibusToEdit._id, data as MinibusUpdateData);
        // alert('Minibus updated successfully!'); // Or use a more sophisticated notification
      } else {
        await createMinibus(data as MinibusData);
        // alert('Minibus added successfully!'); // Or use a more sophisticated notification
      }
      await fetchMinibuses(); // Refresh list
      handleCloseModal();
    } catch (err) {
      console.error("Error submitting minibus:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to save minibus."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMinibus = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this minibus?")) {
      try {
        setIsLoading(true); // Indicate loading state for the table/page
        await deleteMinibus(id);
        // alert('Minibus deleted successfully!');
        await fetchMinibuses(); // Refresh list
      } catch (err) {
        console.error("Error deleting minibus:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete minibus."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="minibus-management-page">
      <header className="page-header">
        <h1>Minibus Management</h1>
        <button className="add-new-button" onClick={handleOpenModalForAdd}>
          Add New Minibus
        </button>
      </header>

      {isLoading && !minibuses.length && <p>Loading minibuses...</p>}
      {error && <p className="error-message page-error">{error}</p>}

      {!isLoading && !error && minibuses.length === 0 && (
        <p>No minibuses found. Click "Add New Minibus" to get started.</p>
      )}

      {!isLoading && !error && minibuses.length > 0 && (
        <table className="minibuses-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>License Plate</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {minibuses.map((minibus) => (
              <tr key={minibus._id}>
                <td>{minibus.name}</td>
                <td>{minibus.licensePlate}</td>
                <td>{minibus.capacity}</td>
                <td>
                  <span
                    className={`status-badge status-${minibus.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {minibus.status}
                  </span>
                </td>
                <td>
                  <button
                    className="action-button edit-button"
                    onClick={() => handleOpenModalForEdit(minibus)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteMinibus(minibus._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <MinibusFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMinibus}
        minibusToEdit={minibusToEdit}
        isLoading={isSubmitting}
        error={formError}
      />
    </div>
  );
};

export default MinibusManagementPage;
