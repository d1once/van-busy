import React, { useEffect, useState } from 'react';
import MinibusCard from '@/components/MinibusCard';
import { getMinibuses, Minibus } from '@/services/api'; // Import API service and type

const MinibusesPage: React.FC = () => {
  const [minibuses, setMinibuses] = useState<Minibus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMinibuses = async () => {
      try {
        setIsLoading(true);
        const data = await getMinibuses();
        setMinibuses(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch minibuses. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinibuses();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Loading minibuses...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (minibuses.length === 0) {
    return <div className="text-center py-10">No minibuses available at the moment.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Our Minibuses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {minibuses.map(bus => (
          <MinibusCard
            key={bus._id} // Use _id from MongoDB
            name={bus.name}
            capacity={bus.capacity}
            features={bus.features}
            // Pass imageUrl if your card supports it
          />
        ))}
      </div>
    </div>
  );
};
export default MinibusesPage;
