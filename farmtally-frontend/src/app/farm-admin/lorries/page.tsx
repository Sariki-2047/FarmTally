"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Truck, Plus, Edit, Eye, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function LorriesPage() {
  const { data: lorries, isLoading, refetch } = useQuery({
    queryKey: ["organization-lorries"],
    queryFn: () => apiClient.getOrganizationLorries(),
  });

  const lorryList = lorries?.data || [];

  const updateLorryStatus = async (lorryId: string, newStatus: string) => {
    try {
      await apiClient.updateLorryStatus(lorryId, newStatus);
      
      // Special handling for SENT_TO_DEALER status
      if (newStatus === 'SENT_TO_DEALER') {
        toast.success('Lorry sent to dealer successfully');
        
        // Ask if they want to make it available for next delivery
        setTimeout(() => {
          if (confirm('Lorry has been sent to dealer. Would you like to make it available for the next delivery?')) {
            updateLorryStatus(lorryId, 'AVAILABLE');
          }
        }, 1000);
      } else {
        toast.success(`Lorry status updated to ${newStatus.replace('_', ' ')}`);
      }
      
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Error updating lorry status:', error);
      toast.error("Failed to update lorry status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'LOADING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-purple-100 text-purple-800';
      case 'PROCESSED':
        return 'bg-indigo-100 text-indigo-800';
      case 'SENT_TO_DEALER':
        return 'bg-gray-100 text-gray-800';
      case 'IN_TRANSIT':
        return 'bg-orange-100 text-orange-800';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lorries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lorry Management</h1>
          <p className="text-gray-600 mt-1">Manage your organization's lorry fleet</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/farm-admin/lorries/add">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Lorry
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lorries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lorryList.length}</div>
              <p className="text-xs text-muted-foreground">In your fleet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lorryList.filter((l: any) => l.status === 'AVAILABLE').length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lorryList.filter((l: any) => ['ASSIGNED', 'LOADING', 'SUBMITTED'].includes(l.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">In collection process</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lorryList.filter((l: any) => ['PROCESSED', 'SENT_TO_DEALER'].includes(l.status)).length}
              </div>
              <p className="text-xs text-muted-foreground">Completed/Sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Lorries List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lorry Fleet</CardTitle>
                <CardDescription>Manage your organization's lorries</CardDescription>
              </div>
              <Link href="/farm-admin/lorries/add">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lorry
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lorryList.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No lorries</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first lorry to the fleet.
                </p>
                <div className="mt-6">
                  <Link href="/farm-admin/lorries/add">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lorry
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Capacity (tons)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lorryList.map((lorry: any) => (
                    <TableRow key={lorry.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          {lorry.plateNumber}
                        </div>
                      </TableCell>
                      <TableCell>{lorry.capacity}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lorry.status)}>
                          {lorry.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lorry.assignedTo ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{lorry.assignedTo.firstName} {lorry.assignedTo.lastName}</span>
                            <span className="text-xs text-gray-500">{lorry.assignedTo.email}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(lorry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={lorry.status}
                            onValueChange={(newStatus) => updateLorryStatus(lorry.id, newStatus)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AVAILABLE">Available</SelectItem>
                              <SelectItem value="ASSIGNED">Assigned</SelectItem>
                              <SelectItem value="LOADING">Loading</SelectItem>
                              <SelectItem value="SUBMITTED">Submitted</SelectItem>
                              <SelectItem value="PROCESSED">Processed</SelectItem>
                              <SelectItem value="SENT_TO_DEALER">Sent to Dealer</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}