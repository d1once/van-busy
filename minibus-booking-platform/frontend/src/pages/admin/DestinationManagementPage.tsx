// minibus-booking-platform/frontend/src/pages/admin/DestinationManagementPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  getDestinations, 
  createDestination, 
  updateDestination, 
  deleteDestination, 
  Destination,
  DestinationData,
  DestinationUpdateData
} from '../../services/destinationService';
import DestinationFormModal from '../../components/admin/DestinationFormModal';
import './DestinationManagementPage.css';

const DestinationManagementPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For table loading
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submission
  const [error, setError] = useState<string | null>(null); // For general page errors
  const [formError, setFormError] = useState<string | null>(null); // For form/modal errors

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(null);

  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDestinations();
      setDestinations(data);
      setError(null);
    } catch (err) {
      console.error("Error in fetchDestinations:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch destinations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleOpenModalForAdd = () => {
    setDestinationToEdit(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (destination: Destination) => {
    setDestinationToEdit(destination);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDestinationToEdit(null);
    setFormError(null);
  };

  const handleSubmitDestination = async (data: DestinationData | DestinationUpdateData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (destinationToEdit) {
        await updateDestination(destinationToEdit._id, data as DestinationUpdateData);
      } else {
        await createDestination(data as DestinationData);
      }
      await fetchDestinations(); // Refresh list
      handleCloseModal();
    } catch (err) {
      console.error("Error submitting destination:", err);
      setFormError(err instanceof Error ? err.message : 'Failed to save destination.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        setIsLoading(true); // Indicate loading state for the table/page
        await deleteDestination(id);
        await fetchDestinations(); // Refresh list
      } catch (err) {
        console.error("Error deleting destination:", err);
        setError(err instanceof Error ? err.message : 'Failed to delete destination.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="destination-management-page">
      <header className="page-header">
        <h1>Destination Management</h1>
        <button className="add-new-button" onClick={handleOpenModalForAdd}>Add New Destination</button>
      </header>

      {isLoading && !destinations.length && <p>Loading destinations...</p>}
      {error && <p className="error-message page-error">{error}</p>}
      
      {!isLoading && !error && destinations.length === 0 && (
        <p>No destinations found. Click "Add New Destination" to get started.</p>
      )}

      {!isLoading && !error && destinations.length > 0 && (
        <table className="destinations-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((destination) => (
              <tr key={destination._id}>
                <td>{destination.name}</td>
                <td>{destination.location}</td>
                <td>${destination.price.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${destination.status.toLowerCase()}`}>
                    {destination.status}
                  </span>
                </td>
                <td>
                  <button className="action-button edit-button" onClick={() => handleOpenModalForEdit(destination)}>Edit</button>
                  <button className="action-button delete-button" onClick={() => handleDeleteDestination(destination._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <DestinationFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitDestination}
        destinationToEdit={destinationToEdit}
        isLoading={isSubmitting}
        error={formError}
      />
    </div>
  );
};

export default DestinationManagementPage;
