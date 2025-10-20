"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { 
  Users, 
  Building2, 
  UserCheck, 
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { RecentActivity } from "@/components/admin/recent-activity";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.getSystemStats(),
  });

  const systemStats = stats?.data || {
    totalOrganizations: 0,
    totalFarmAdmins: 0,
    pendingApprovals: 0,
    totalFieldManagers: 0,
    totalFarmers: 0,
    totalDeliveries: 0,
    totalAdvancePayments: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage the FarmTally platform
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/approvals">
            <Button className="bg-red-600 hover:bg-red-700">
              <UserCheck className="mr-2 h-4 w-4" />
              Review Pending ({systemStats.pendingApprovals})
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Total Organizations"
          value={systemStats.totalOrganizations}
          icon={Building2}
          trend="+12%"
          trendUp={true}
          description="Active organizations"
        />
        <AdminStatsCard
          title="Farm Admins"
          value={systemStats.totalFarmAdmins}
          icon={Users}
          trend="+8%"
          trendUp={true}
          description="Approved administrators"
        />
        <AdminStatsCard
          title="Pending Approvals"
          value={systemStats.pendingApprovals}
          icon={AlertTriangle}
          trend="Urgent"
          trendUp={false}
          description="Awaiting review"
          urgent={systemStats.pendingApprovals > 0}
        />
        <AdminStatsCard
          title="Total Users"
          value={systemStats.totalFarmAdmins + systemStats.totalFieldManagers + systemStats.totalFarmers}
          icon={Activity}
          trend="+15%"
          trendUp={true}
          description="All platform users"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-red-500" />
                  Pending Farm Admin Approvals
                </CardTitle>
                <CardDescription>
                  New Farm Admin registrations awaiting your review
                </CardDescription>
              </div>
              {systemStats.pendingApprovals > 0 && (
                <Badge variant="destructive">
                  {systemStats.pendingApprovals} Pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {systemStats.pendingApprovals > 0 ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-medium">
                      {systemStats.pendingApprovals} Farm Admin{systemStats.pendingApprovals > 1 ? 's' : ''} waiting for approval
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    These users cannot access their dashboards until approved.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Link href="/admin/approvals">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Review Pending Approvals
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All Farm Admin registrations have been reviewed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              System Health
            </CardTitle>
            <CardDescription>
              Platform status and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium">
                {systemStats.totalFarmAdmins + systemStats.totalFieldManagers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Deliveries</span>
              <span className="text-sm font-medium">
                {systemStats.totalDeliveries.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/approvals">
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                Review Approvals
              </Button>
            </Link>
            <Link href="/admin/farm-admins">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Farm Admins
              </Button>
            </Link>
            <Link href="/admin/organizations">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                View Organizations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}