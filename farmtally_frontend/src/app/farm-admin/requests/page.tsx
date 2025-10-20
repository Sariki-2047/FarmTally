"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Truck, Calendar, MapPin, User, Package, Check, X } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function LorryRequestsPage() {
  const [selectedLorry, setSelectedLorry] = useState<{ [key: string]: string }>({});

  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ["lorry-requests"],
    queryFn: () => apiClient.getLorryRequests(),
  });

  const { data: lorries, isLoading: lorriesLoading } = useQuery({
    queryKey: ["organization-lorries"],
    queryFn: () => apiClient.getOrganizationLorries(),
  });

  const requestList = requests?.data || [];
  const lorryList = lorries?.data || [];
  const availableLorries = lorryList.filter((lorry: any) => lorry.status === 'AVAILABLE');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const lorryId = selectedLorry[requestId];
    if (!lorryId) {
      toast.error("Please select a lorry to assign");
      return;
    }

    try {
      console.log('Approving request:', requestId, 'with lorry:', lorryId);
      const response = await apiClient.updateLorryRequestStatus(requestId, 'APPROVED', lorryId);
      console.log('Approve response:', response);
      
      if (response.success) {
        toast.success("Request approved and lorry assigned!");
        refetchRequests();
        setSelectedLorry(prev => ({ ...prev, [requestId]: '' }));
      } else {
        throw new Error(response.error || response.message || "Failed to approve request");
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error instanceof Error ? error.message : "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      console.log('Rejecting request:', requestId);
      const response = await apiClient.updateLorryRequestStatus(requestId, 'REJECTED');
      console.log('Reject response:', response);
      
      if (response.success) {
        toast.success("Request rejected");
        refetchRequests();
      } else {
        throw new Error(response.error || response.message || "Failed to reject request");
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error instanceof Error ? error.message : "Failed to reject request");
    }
  };

  if (requestsLoading || lorriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lorry Requests</h1>
        <p className="text-gray-600 mt-1">Review and manage lorry requests from field managers</p>
      </div>

      {/* Main Content */}
      <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requestList.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Truck className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requestList.filter((r: any) => r.status === 'PENDING').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requestList.filter((r: any) => r.status === 'APPROVED').length}
              </div>
              <p className="text-xs text-muted-foreground">Lorries assigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Lorries</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableLorries.length}</div>
              <p className="text-xs text-muted-foreground">Ready to assign</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Lorry Requests</CardTitle>
            <CardDescription>Review and approve lorry requests from field managers</CardDescription>
          </CardHeader>
          <CardContent>
            {requestList.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No lorry requests have been submitted yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Field Manager</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date Needed</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Lorry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestList.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.manager.firstName} {request.manager.lastName}</p>
                          <p className="text-sm text-gray-500">{request.manager.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.location}</TableCell>
                      <TableCell>
                        {new Date(request.requestedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{request.estimatedWeight.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.assignedLorry ? (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">
                              {request.assignedLorry.plateNumber}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {request.assignedLorry.capacity}T
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedLorry[request.id] || ''}
                              onValueChange={(value) => 
                                setSelectedLorry(prev => ({ ...prev, [request.id]: value }))
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select lorry" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableLorries.map((lorry: any) => (
                                  <SelectItem key={lorry.id} value={lorry.id}>
                                    {lorry.plateNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={!selectedLorry[request.id]}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {request.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
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