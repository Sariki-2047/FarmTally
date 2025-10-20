"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Truck, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { apiClient } from "@/lib/api";

const lorryRequestSchema = z.object({
  requestedDate: z.string().min(1, "Requested date is required"),
  estimatedGunnyBags: z.number().min(1, "Estimated gunny bags must be at least 1"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
});

type LorryRequestFormData = z.infer<typeof lorryRequestSchema>;

export default function RequestLorryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LorryRequestFormData>({
    resolver: zodResolver(lorryRequestSchema),
  });

  const onSubmit = async (data: LorryRequestFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.createLorryRequest({
        requestedDate: data.requestedDate,
        estimatedGunnyBags: data.estimatedGunnyBags,
        location: data.location,
        notes: data.notes,
      });

      if (response.success) {
        toast.success("Lorry request submitted successfully!");
        reset();
        router.push("/field-manager");
      } else {
        throw new Error(response.message || "Failed to submit lorry request");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit lorry request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/field-manager" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Request Lorry</h1>
        <p className="text-gray-600 mt-1">Submit a request for lorry assignment</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <CardTitle>Lorry Request Details</CardTitle>
            </div>
            <CardDescription>
              Provide details for your lorry request. The Farm Admin will review and assign a suitable lorry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requestedDate">Requested Date</Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    min={minDate}
                    {...register("requestedDate")}
                    className="mt-1"
                  />
                  {errors.requestedDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.requestedDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedGunnyBags">Estimated Gunny Bags</Label>
                  <Input
                    id="estimatedGunnyBags"
                    type="number"
                    min="1"
                    placeholder="e.g., 100"
                    {...register("estimatedGunnyBags", { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.estimatedGunnyBags && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedGunnyBags.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Collection Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Village Name, District"
                  {...register("location")}
                  className="mt-1"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  className="mt-1"
                  placeholder="Any special requirements or additional information..."
                  rows={4}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Request Process
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your request will be sent to the Farm Admin</li>
                        <li>Farm Admin will review and assign a suitable lorry</li>
                        <li>You'll be notified once the lorry is assigned</li>
                        <li>Track the status from your dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Link href="/field-manager">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}