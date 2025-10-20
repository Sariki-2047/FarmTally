"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, MapPin, Calendar, Package, User, Play, Eye } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface Lorry {
  id: string;
  plateNumber: string;
  capacity: number;
  status: string;
  requestId: string;
  location: string;
  requestedDate: string;
  estimatedWeight: number;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function ActiveLorriesPage() {
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchActiveLorries();
  }, []);

  const fetchActiveLorries = async () => {
    try {
      // Fetch lorries assigned to this field manager from approved requests
      const response = await apiClient.getLorryRequests();
      if (response.success) {
        // Filter approved requests with assigned lorries
        const approvedRequests = response.data.filter((request: any) => 
          request.status === 'APPROVED' && request.assignedLorry
        );
        
        // Extract unique lorries
        const uniqueLorries = approvedRequests.reduce((acc: any[], request: any) => {
          const existingLorry = acc.find(l => l.id === request.assignedLorry.id);
          if (!existingLorry) {
            acc.push({
              ...request.assignedLorry,
              requestId: request.id,
              location: request.location,
              requestedDate: request.requestedDate,
              estimatedWeight: request.estimatedWeight
            });
          }
          return acc;
        }, []);
        
        // Filter out submitted and completed lorries - only show active ones
        const activeLorries = uniqueLorries.filter(lorry => 
          lorry.status !== 'SUBMITTED' && 
          lorry.status !== 'SENT_TO_DEALER'
        );
        
        setLorries(activeLorries);
      } else {
        toast.error('Failed to fetch active lorries');
      }
    } catch (error) {
      console.error('Error fetching lorries:', error);
      toast.error('Failed to fetch active lorries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'LOADING': return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED': return 'bg-purple-100 text-purple-800';
      case 'SENT_TO_DEALER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Lorries</h1>
        <p className="text-gray-600">Lorries assigned to you for field operations</p>
      </div>

      {lorries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active lorries</h3>
            <p className="text-gray-500 text-center mb-4">
              You don't have any lorries assigned to you at the moment. 
              Request a lorry to start collecting corn from farmers.
            </p>
            <Button asChild>
              <a href="/field-manager/request-lorry">Request Lorry</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Lorries</CardTitle>
            <CardDescription>
              Lorries assigned to you for field operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lorry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Est. Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lorries.map((lorry) => (
                  <TableRow key={lorry.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        {lorry.plateNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {lorry.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(lorry.requestedDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{lorry.capacity} tons</TableCell>
                    <TableCell>{lorry.estimatedWeight.toLocaleString()} kg</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lorry.status)}>
                        {lorry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Link href={`/field-manager/lorries/${lorry.id}/collection`}>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Start Collection
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}