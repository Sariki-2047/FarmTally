# System Admin Dashboard - Frontend Implementation Example

## 🎛 Dashboard Overview

This document provides frontend implementation examples for the System Admin Dashboard in FarmTally.

## 📊 Dashboard Components

### 1. Dashboard Statistics Component

```typescript
// components/SystemAdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
  totalOrganizations: number;
  activeOrganizations: number;
  recentRegistrations: number;
  usersByRole: Record<string, number>;
  recentPendingUsers: any[];
}

export const SystemAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/system-admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="flex justify-center p-8">Failed to load dashboard</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Admin Dashboard</h1>
        <Button onClick={fetchDashboardStats}>Refresh</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingUsers}
          icon="⏳"
          color="yellow"
          urgent={stats.pendingUsers > 0}
        />
        <StatCard
          title="Active Users"
          value={stats.approvedUsers}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Organizations"
          value={stats.totalOrganizations}
          icon="🏢"
          color="purple"
        />
      </div>

      {/* User Distribution by Role */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600">{formatRole(role)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pending Users */}
      {stats.recentPendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Pending Registrations
              <Badge variant="secondary">{stats.recentPendingUsers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentPendingUsers.map((user) => (
                <PendingUserCard key={user.id} user={user} onAction={fetchDashboardStats} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Statistics Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  urgent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, urgent }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <Card className={`${colorClasses[color]} ${urgent ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-70">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
        {urgent && (
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs">Requires Attention</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Utility function to format role names
const formatRole = (role: string): string => {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};
```

### 2. Pending Users Management Component

```typescript
// components/PendingUserCard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PendingUserCardProps {
  user: {
    id: string;
    email: string;
    phone?: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
      address?: string;
    };
    organization?: {
      name: string;
      code: string;
    };
    createdAt: string;
  };
  onAction: () => void;
}

export const PendingUserCard: React.FC<PendingUserCardProps> = ({ user, onAction }) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    setApproving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/system-admin/users/${user.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalNotes })
      });

      if (response.ok) {
        onAction(); // Refresh the list
        setApprovalNotes('');
      } else {
        console.error('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setRejecting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/system-admin/users/${user.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });

      if (response.ok) {
        onAction(); // Refresh the list
        setRejectionReason('');
      } else {
        console.error('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-400">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">
                {user.profile.firstName} {user.profile.lastName}
              </h3>
              <Badge variant="outline">{formatRole(user.role)}</Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <div>📧 {user.email}</div>
              {user.phone && <div>📱 {user.phone}</div>}
              {user.organization && (
                <div>🏢 {user.organization.name} ({user.organization.code})</div>
              )}
              <div>📅 Registered: {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Approve Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" disabled={approving}>
                  ✅ Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve User Registration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p><strong>User:</strong> {user.profile.firstName} {user.profile.lastName}</p>
                    <p><strong>Role:</strong> {formatRole(user.role)}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Approval Notes (Optional)
                    </label>
                    <Textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add any notes for the user..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleApprove}
                      disabled={approving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {approving ? 'Approving...' : 'Confirm Approval'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={rejecting}>
                  ❌ Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject User Registration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p><strong>User:</strong> {user.profile.firstName} {user.profile.lastName}</p>
                    <p><strong>Role:</strong> {formatRole(user.role)}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a clear reason for rejection..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleReject}
                      disabled={rejecting || !rejectionReason.trim()}
                      variant="destructive"
                    >
                      {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3. User Management Table Component

```typescript
// components/UserManagementTable.tsx
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  organization?: {
    name: string;
    code: string;
  };
  createdAt: string;
  approvedAt?: string;
}

export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.role !== 'all') queryParams.append('role', filters.role);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`/api/system-admin/users/pending?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, suspend: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/system-admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspend })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { variant: 'default', color: 'bg-green-100 text-green-800' },
      REJECTED: { variant: 'destructive', color: 'bg-red-100 text-red-800' },
      SUSPENDED: { variant: 'outline', color: 'bg-gray-100 text-gray-800' }
    };

    const config = variants[status as keyof typeof variants] || variants.PENDING;
    
    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value, page: 1})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value, page: 1})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="FARM_ADMIN">Farm Admin</SelectItem>
            <SelectItem value="FIELD_MANAGER">Field Manager</SelectItem>
            <SelectItem value="FARMER">Farmer</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.profile.firstName} {user.profile.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatRole(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.organization ? (
                      <div>
                        <div className="font-medium">{user.organization.name}</div>
                        <div className="text-sm text-gray-500">{user.organization.code}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No organization</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    {user.approvedAt && (
                      <div className="text-xs text-gray-500">
                        Approved: {new Date(user.approvedAt).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusToggle(user.id, true)}
                        >
                          Suspend
                        </Button>
                      )}
                      {user.status === 'SUSPENDED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusToggle(user.id, false)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
```

### 4. Main System Admin Layout

```typescript
// pages/system-admin/dashboard.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemAdminDashboard } from '@/components/SystemAdminDashboard';
import { UserManagementTable } from '@/components/UserManagementTable';

export default function SystemAdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <SystemAdminDashboard />
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
              </div>
              <UserManagementTable />
            </div>
          </TabsContent>

          <TabsContent value="organizations">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Organizations</h2>
              </div>
              {/* Organization management component would go here */}
              <div className="text-center py-8 text-gray-500">
                Organization management coming soon...
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

## 🔐 Authentication Guard

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
}

export const useAuth = (requiredRole?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);

        // Check role requirement
        if (requiredRole && data.data.role !== requiredRole) {
          router.push('/unauthorized');
          return;
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, checkAuth };
};

// Usage in system admin pages
export const SystemAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth('APPLICATION_ADMIN');

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};
```

## 🎯 Key Features

- **Real-time Dashboard** - Live statistics and pending user counts
- **User Approval Workflow** - Easy approve/reject with notes
- **Bulk Operations** - Approve multiple users at once
- **User Management** - Suspend/reactivate users
- **Email Integration** - Automatic notifications
- **Role-based Access** - Secure system admin only access
- **Responsive Design** - Works on all devices

This dashboard provides a complete system admin interface for managing FarmTally users and organizations! 🎛✨