"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Phone, Mail, Search, Plus, UserPlus, Eye, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface FieldManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  approvedAt?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function FieldManagersPage() {
  const [fieldManagers, setFieldManagers] = useState<FieldManager[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [managersResponse, invitationsResponse] = await Promise.all([
        apiClient.getFieldManagers(),
        apiClient.getMyInvitations()
      ]);

      if (managersResponse.success) {
        setFieldManagers(managersResponse.data || []);
      }

      if (invitationsResponse.success) {
        // Filter for Field Manager invitations only
        const fieldManagerInvitations = (invitationsResponse.data || []).filter(
          (inv: Invitation) => inv.role === 'FIELD_MANAGER'
        );
        setInvitations(fieldManagerInvitations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch field managers and invitations');
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = fieldManagers.filter(manager =>
    `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (manager.phone && manager.phone.includes(searchTerm))
  );

  const filteredInvitations = invitations.filter(invitation =>
    invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingInvitations = filteredInvitations.filter(inv => !inv.isUsed);
  const totalCount = filteredManagers.length + pendingInvitations.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUSPENDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Field Managers</h1>
        <p className="text-gray-600">Manage your field operations team</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search field managers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <a href="/farm-admin/invite-field-manager">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Field Manager
          </a>
        </Button>
      </div>

      {totalCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No field managers found' : 'No field managers yet'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms to find field managers or invitations.'
                : 'Start by inviting field managers to join your organization.'
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <a href="/farm-admin/invite-field-manager">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite First Field Manager
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Field Managers & Invitations</CardTitle>
            <CardDescription>
              Manage your field operations team and pending invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name/Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Active Field Managers */}
                {filteredManagers.map((manager) => (
                  <TableRow key={`manager-${manager.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        {manager.firstName} {manager.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{manager.email}</span>
                        </div>
                        {manager.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{manager.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(manager.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Pending Invitations */}
                {pendingInvitations.map((invitation) => (
                  <TableRow key={`invitation-${invitation.id}`} className="bg-yellow-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-yellow-600" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">Invitation sent</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Resend
                        </Button>
                        <Button size="sm" variant="outline">
                          Cancel
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
    </div>
  );
}