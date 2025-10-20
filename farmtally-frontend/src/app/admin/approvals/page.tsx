"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { 
  UserCheck, 
  UserX, 
  Building2, 
  Mail, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

interface PendingFarmAdmin {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  organization_id: string | null;
  created_at: string;
}

export default function ApprovalsPage() {
  const [selectedAdmin, setSelectedAdmin] = useState<PendingFarmAdmin | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: pendingAdmins, isLoading } = useQuery({
    queryKey: ["pending-farm-admins"],
    queryFn: () => apiClient.getPendingFarmAdmins(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ userId, approved, rejectionReason }: { 
      userId: string; 
      approved: boolean; 
      rejectionReason?: string;
    }) => apiClient.reviewFarmAdmin(userId, approved, rejectionReason),
    onSuccess: (data, variables) => {
      toast.success(
        variables.approved 
          ? "Farm Admin approved successfully!" 
          : "Farm Admin rejected successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["pending-farm-admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setReviewDialog(false);
      setSelectedAdmin(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Review failed");
    },
  });

  const handleReview = (admin: PendingFarmAdmin, action: 'approve' | 'reject') => {
    setSelectedAdmin(admin);
    setReviewAction(action);
    setReviewDialog(true);
  };

  const confirmReview = () => {
    if (!selectedAdmin) return;

    reviewMutation.mutate({
      userId: selectedAdmin.id,
      approved: reviewAction === 'approve',
      rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
    });
  };

  const admins = pendingAdmins?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and approve Farm Admin registrations
          </p>
        </div>
        <Badge variant={admins.length > 0 ? "destructive" : "secondary"}>
          {admins.length} Pending
        </Badge>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pending approvals...</p>
            </div>
          </CardContent>
        </Card>
      ) : admins.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-2 text-gray-600">
              No pending Farm Admin approvals at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Farm Admin Registrations Awaiting Review
            </CardTitle>
            <CardDescription>
              These users have registered as Farm Admins and are waiting for your approval to access their dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin: PendingFarmAdmin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {admin.profile?.firstName || 'Unknown'} {admin.profile?.lastName || 'User'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="mr-1 h-3 w-3" />
                          {admin.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {admin.organization_id ? 'Organization Created' : 'New Organization'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(admin.created_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        PENDING
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(admin, 'approve')}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <UserCheck className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(admin, 'reject')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserX className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {reviewAction === 'approve' ? (
                <UserCheck className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <UserX className="mr-2 h-5 w-5 text-red-500" />
              )}
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Farm Admin
            </DialogTitle>
            <DialogDescription>
              {selectedAdmin && (
                <>
                  You are about to {reviewAction} the Farm Admin registration for{' '}
                  <strong>{selectedAdmin.profile?.firstName} {selectedAdmin.profile?.lastName}</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div><strong>Name:</strong> {selectedAdmin.profile?.firstName} {selectedAdmin.profile?.lastName}</div>
                <div><strong>Email:</strong> {selectedAdmin.email}</div>
                <div><strong>Role:</strong> {selectedAdmin.role}</div>
                <div><strong>Registration Date:</strong> {format(new Date(selectedAdmin.created_at), 'PPP')}</div>
              </div>

              {reviewAction === 'reject' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rejection Reason (Optional)
                  </label>
                  <Textarea
                    placeholder="Provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className={`p-4 rounded-lg ${
                reviewAction === 'approve' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  reviewAction === 'approve' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {reviewAction === 'approve' 
                    ? 'This user will be able to access their Farm Admin dashboard and manage their organization.'
                    : 'This user will not be able to access the Farm Admin dashboard. They can register again if needed.'
                  }
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              disabled={reviewMutation.isPending}
              className={reviewAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewMutation.isPending ? 'Processing...' : (
                <>
                  {reviewAction === 'approve' ? (
                    <UserCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <UserX className="mr-2 h-4 w-4" />
                  )}
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}