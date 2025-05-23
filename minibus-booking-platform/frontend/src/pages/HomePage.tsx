import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Ensure this path is correct

const HomePage: React.FC = () => {
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-primary">
        Welcome to Minibus Booking Services
      </h1>
      <p className="text-lg lg:text-xl mb-8 text-muted-foreground">
        Your adventure starts here. Find and book the perfect tour with ease!
      </p>
      <Button size="lg" asChild>
        <Link to="/destinations">Browse Destinations</Link>
      </Button>
    </div>
  );
};
export default HomePage;
