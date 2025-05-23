import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MinibusCardProps {
  name: string;
  capacity: number;
  features?: string[]; // Optional
}

const MinibusCard: React.FC<MinibusCardProps> = ({ name, capacity, features }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>Capacity: {capacity} passengers</CardDescription>
        {features && features.length > 0 && (
          <div className="mt-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button>Check Availability</Button>
      </CardFooter>
    </Card>
  );
};
export default MinibusCard;
