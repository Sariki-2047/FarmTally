"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Download,
  Calendar,
  FileText,
  PieChart,
  Activity
} from "lucide-react";

interface ReportData {
  title: string;
  description: string;
  type: 'chart' | 'table' | 'metric';
  data: any;
  period: string;
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod, selectedReport]);

  const loadReports = async () => {
    // Mock data - replace with actual API calls
    const mockReports: ReportData[] = [
      {
        title: "User Registration Trends",
        description: "New user registrations over time",
        type: "chart",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          values: [12, 19, 15, 25]
        },
        period: selectedPeriod
      },
      {
        title: "Organization Growth",
        description: "Number of organizations by status",
        type: "metric",
        data: {
          total: 45,
          active: 42,
          inactive: 2,
          suspended: 1
        },
        period: selectedPeriod
      },
      {
        title: "User Distribution",
        description: "Users by role across all organizations",
        type: "chart",
        data: {
          farmAdmins: 45,
          fieldManagers: 128,
          farmers: 1250
        },
        period: selectedPeriod
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  };

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting report as ${format}`);
    // In real implementation, this would trigger a download
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">System-wide reports and analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">System Overview</SelectItem>
                  <SelectItem value="users">User Analytics</SelectItem>
                  <SelectItem value="organizations">Organization Reports</SelectItem>
                  <SelectItem value="activity">Activity Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,423</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+5%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>User Registration Trends</span>
            </CardTitle>
            <CardDescription>New user registrations over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization would appear here</p>
                <p className="text-sm text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>User Distribution by Role</span>
            </CardTitle>
            <CardDescription>Breakdown of users by their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Farmers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">1,250</span>
                  <Badge variant="secondary">87.8%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Field Managers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">128</span>
                  <Badge variant="secondary">9.0%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Farm Admins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">45</span>
                  <Badge variant="secondary">3.2%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest activities across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New organization registered</p>
                <p className="text-xs text-gray-600">Green Valley Farms - 2 hours ago</p>
              </div>
              <Badge variant="outline">New</Badge>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Activity className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">25 new farmer registrations</p>
                <p className="text-xs text-gray-600">Across 5 organizations - Today</p>
              </div>
              <Badge variant="outline">Growth</Badge>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <FileText className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly report generated</p>
                <p className="text-xs text-gray-600">System performance report - Yesterday</p>
              </div>
              <Badge variant="outline">Report</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => exportReport('pdf')} className="h-20">
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div>PDF Report</div>
                <div className="text-xs text-gray-500">Formatted report</div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')} className="h-20">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div>CSV Data</div>
                <div className="text-xs text-gray-500">Raw data export</div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => exportReport('excel')} className="h-20">
              <div className="text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                <div>Excel Report</div>
                <div className="text-xs text-gray-500">With charts</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}