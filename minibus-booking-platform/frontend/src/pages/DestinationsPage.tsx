import React, { useEffect, useState } from "react";
import DestinationCard from "@/components/DestinationCard";
import { getDestinations } from "@/services/api"; // Import API service and type
import type { Destination } from "@/services/api";

const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const data = await getDestinations();
        setDestinations(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch destinations. Please try again later.");
        console.error(err); // Log the actual error for debugging
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []); // Empty dependency array means this runs once on mount

  if (isLoading) {
    return <div className="text-center py-10">Loading destinations...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-10">
        No destinations available at the moment.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Our Destinations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((dest) => (
          <DestinationCard
            key={dest._id} // Use _id from MongoDB
            title={dest.name}
            description={dest.description}
            imageUrl={
              dest.imageUrl ||
              "https://via.placeholder.com/300x200?text=No+Image"
            } // Provide a fallback
            // Pass price or other props if your card supports them
          />
        ))}
      </div>
    </div>
  );
};
export default DestinationsPage;
