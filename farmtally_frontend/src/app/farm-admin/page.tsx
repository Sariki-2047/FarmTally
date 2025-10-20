"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, UserPlus, Users, Mail, Truck, Package } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export default function FarmAdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is Farm Admin but not approved
  if (user?.role === "FARM_ADMIN" && user?.status === "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
              <CardDescription>
                Your Farm Admin account is awaiting administrator approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Access Restricted
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your account is currently under review. You'll be able to access your dashboard once approved by an administrator.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is not Farm Admin
  if (user?.role !== "FARM_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600">You need Farm Admin privileges to access this area.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch dashboard data
  const { data: invitations } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: () => apiClient.getMyInvitations(),
  });

  const { data: fieldManagers } = useQuery({
    queryKey: ["field-managers"],
    queryFn: () => apiClient.getFieldManagers(),
  });

  const pendingInvitations = invitations?.data?.filter((inv: any) => !inv.isUsed) || [];
  const activeFieldManagers = fieldManagers?.data || [];

  // Approved Farm Admin - show full dashboard
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.firstName} {user?.lastName}</p>
      </div>

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Field Managers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeFieldManagers.length}</div>
              <p className="text-xs text-muted-foreground">Active field managers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInvitations.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting registration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lorry Requests</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Managers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Field Managers</CardTitle>
                  <CardDescription>Manage your field team</CardDescription>
                </div>
                <Link href="/farm-admin/invite-field-manager">
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {activeFieldManagers.length === 0 && pendingInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No field managers</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by inviting your first field manager.
                  </p>
                  <div className="mt-6">
                    <Link href="/farm-admin/invite-field-manager">
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Field Manager
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Field Managers */}
                  {activeFieldManagers.map((manager: any) => (
                    <div key={manager.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{manager.firstName} {manager.lastName}</p>
                          <p className="text-xs text-gray-500">{manager.email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-green-600 font-medium">Active</div>
                    </div>
                  ))}
                  
                  {/* Pending Invitations */}
                  {pendingInvitations.map((invitation: any) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{invitation.email}</p>
                          <p className="text-xs text-gray-500">Invitation sent</p>
                        </div>
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">Pending</div>
                    </div>
                  ))}
                  
                  {(activeFieldManagers.length > 0 || pendingInvitations.length > 0) && (
                    <div className="pt-2">
                      <Link href="/farm-admin/field-managers">
                        <Button variant="outline" size="sm" className="w-full">
                          View All Field Managers
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Your organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Organization Name</Label>
                <p className="text-sm font-medium">{user?.organization?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Admin</Label>
                <p className="text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common farm admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/farm-admin/lorries" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="mr-2 h-4 w-4" />
                  Manage Lorries
                </Button>
              </Link>
              <Link href="/farm-admin/requests" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Review Requests
                </Button>
              </Link>
              <Link href="/farm-admin/invite-field-manager" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Field Manager
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}