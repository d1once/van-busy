import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DestinationCardProps {
  title: string;
  description: string;
  imageUrl?: string; // Optional
}

const DestinationCard: React.FC<DestinationCardProps> = ({ title, description, imageUrl }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {imageUrl && <img src={imageUrl} alt={title} className="rounded-md mt-2 max-h-40 w-full object-cover" />}
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  );
};
export default DestinationCard;
