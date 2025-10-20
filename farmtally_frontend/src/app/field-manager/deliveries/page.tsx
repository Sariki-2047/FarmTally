"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, User, Truck, Calendar, Phone, IndianRupee, Eye } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Delivery {
  id: string;
  farmer: {
    name: string;
    phone: string;
  };
  lorry: {
    plateNumber: string;
    status?: string;
  };
  bagsCount: number;
  grossWeight?: number;
  standardDeduction?: number;
  qualityDeduction?: number;
  netWeight?: number;
  moistureContent?: number;
  qualityGrade?: string;
  advanceAmount?: number;
  pricePerKg?: number;
  totalValue?: number;
  finalAmount?: number;
  status: string;
  deliveryDate?: string;
  createdAt: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await apiClient.getDeliveries();
      if (response.success) {
        setDeliveries(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch deliveries');
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLorryStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'LOADING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT': return 'bg-orange-100 text-orange-800';
      case 'SUBMITTED': return 'bg-indigo-100 text-indigo-800';
      case 'PROCESSED': return 'bg-teal-100 text-teal-800';
      case 'SENT_TO_DEALER': return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
        <p className="text-gray-600">Track corn deliveries and quality assessments</p>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Start collecting corn from farmers to see deliveries here.
              Make sure you have an active lorry assigned to you.
            </p>
            <Button asChild>
              <a href="/field-manager/lorries">View Active Lorries</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>My Deliveries</CardTitle>
            <CardDescription>
              Complete delivery records with financial calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lorry</TableHead>
                    <TableHead>Lorry Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Bags</TableHead>
                    <TableHead>Gross Weight (kg)</TableHead>
                    <TableHead>Standard Deduction</TableHead>
                    <TableHead>Quality Deduction</TableHead>
                    <TableHead>Net Weight (kg)</TableHead>
                    <TableHead>Advance (₹)</TableHead>
                    <TableHead>Price/kg (₹)</TableHead>
                    <TableHead>Gross Total (₹)</TableHead>
                    <TableHead>Net Total (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          {delivery.lorry.plateNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLorryStatusColor(delivery.lorry.status || 'AVAILABLE')}>
                          {delivery.lorry.status || 'AVAILABLE'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : new Date(delivery.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {delivery.farmer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {delivery.farmer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {delivery.bagsCount} bags
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(delivery.grossWeight || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        -{(delivery.standardDeduction || 0)} kg
                      </TableCell>
                      <TableCell className="text-red-600">
                        -{(delivery.qualityDeduction || 0)} kg
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {(delivery.netWeight || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {(delivery.advanceAmount || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {delivery.pricePerKg || 0}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {(delivery.totalValue || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {(delivery.finalAmount || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}