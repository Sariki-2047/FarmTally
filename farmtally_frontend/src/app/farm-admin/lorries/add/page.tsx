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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Truck, Plus } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { apiClient } from "@/lib/api";

const addLorrySchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

type AddLorryFormData = z.infer<typeof addLorrySchema>;

export default function AddLorryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddLorryFormData>({
    resolver: zodResolver(addLorrySchema),
  });

  const onSubmit = async (data: AddLorryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.createLorry({
        plateNumber: data.plateNumber,
        capacity: data.capacity,
      });

      if (response.success) {
        toast.success("Lorry added successfully!");
        reset();
        router.push("/farm-admin/lorries");
      } else {
        throw new Error(response.message || "Failed to add lorry");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add lorry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/farm-admin/lorries" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lorries
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Lorry</h1>
        <p className="text-gray-600 mt-1">Add a new lorry to your fleet</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <CardTitle>Lorry Details</CardTitle>
            </div>
            <CardDescription>
              Enter the details of the new lorry to add to your fleet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input
                  id="plateNumber"
                  type="text"
                  placeholder="e.g., AP 01 AB 1234"
                  {...register("plateNumber")}
                  className="mt-1"
                />
                {errors.plateNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.plateNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="capacity">Capacity (Gunny Bags)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 200"
                  {...register("capacity", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>



              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <Truck className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Lorry Status
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>New lorries are automatically set to "Available" status</li>
                        <li>Available lorries can be assigned to lorry requests</li>
                        <li>You can update the status later from the lorry management page</li>
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
                      Adding Lorry...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lorry
                    </>
                  )}
                </Button>
                <Link href="/farm-admin/lorries">
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