import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker"; // Custom DatePicker
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getDestinations, getMinibuses, createBooking } from "@/services/api";
import type { BookingPayload, Destination, Minibus } from "@/services/api";

// Zod Schema for validation
const bookingSchema = z.object({
  destinationId: z.string().min(1, { message: "Destination is required." }),
  minibusId: z.string().min(1, { message: "Minibus is required." }),
  customerName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  customerEmail: z.string().email({ message: "Invalid email address." }),
  bookingDate: z
    .date({ required_error: "Booking date is required." })
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Booking date cannot be in the past.",
    }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const BookingPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [minibuses, setMinibuses] = useState<Minibus[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      // bookingDate: undefined, // Let DatePicker handle initial undefined state
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [destData, busData] = await Promise.all([
          getDestinations(),
          getMinibuses(),
        ]);
        setDestinations(destData);
        setMinibuses(busData);
      } catch (error) {
        console.error("Failed to fetch destinations or minibuses", error);
        setSubmitError("Failed to load booking options. Please refresh."); // Use submitError to show this critical error too
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload: BookingPayload = {
      ...data,
      bookingDate: format(data.bookingDate, "yyyy-MM-dd"), // Format date to string for backend
    };

    try {
      const result = await createBooking(payload);
      setSubmitSuccess(result.message || "Booking created successfully!");
      reset(); // Reset form on success
    } catch (error: any) {
      setSubmitError(error.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to disable past dates in DatePicker
  const disablePastDates = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  if (isLoadingData) {
    return <div className="text-center py-10">Loading booking options...</div>;
  }

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Book Your Minibus Tour
          </CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to make your booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Destination Select */}
            <div>
              <Label htmlFor="destinationId">Destination</Label>
              <Controller
                name="destinationId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger id="destinationId">
                      <SelectValue placeholder="Select a destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest._id} value={dest._id}>
                          {dest.name} - ${dest.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.destinationId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.destinationId.message}
                </p>
              )}
            </div>

            {/* Minibus Select */}
            <div>
              <Label htmlFor="minibusId">Minibus</Label>
              <Controller
                name="minibusId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger id="minibusId">
                      <SelectValue placeholder="Select a minibus" />
                    </SelectTrigger>
                    <SelectContent>
                      {minibuses.map((bus) => (
                        <SelectItem key={bus._id} value={bus._id}>
                          {bus.name} (Capacity: {bus.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.minibusId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.minibusId.message}
                </p>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <Label htmlFor="bookingDate">Booking Date</Label>
              <Controller
                name="bookingDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    disabled={disablePastDates} // Pass the disabled function
                  />
                )}
              />
              {errors.bookingDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.bookingDate.message}
                </p>
              )}
            </div>

            {/* Customer Name Input */}
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Controller
                name="customerName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="customerName"
                    placeholder="Your full name"
                    {...field}
                  />
                )}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Customer Email Input */}
            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Controller
                name="customerEmail"
                control={control}
                render={({ field }) => (
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="your@email.com"
                    {...field}
                  />
                )}
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.customerEmail.message}
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-500 text-center">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-green-500 text-center">
                {submitSuccess}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoadingData}
            >
              {isSubmitting ? "Submitting..." : "Book Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default BookingPage;
