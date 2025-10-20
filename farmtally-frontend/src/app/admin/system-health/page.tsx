"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Memory, 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  responseTime: number;
  lastCheck: string;
}

export default function SystemHealthPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    // Mock data - replace with actual API calls
    const mockMetrics: SystemMetric[] = [
      { name: "CPU Usage", value: 45, unit: "%", status: "healthy", threshold: 80 },
      { name: "Memory Usage", value: 62, unit: "%", status: "healthy", threshold: 85 },
      { name: "Disk Usage", value: 78, unit: "%", status: "warning", threshold: 90 },
      { name: "Network I/O", value: 23, unit: "MB/s", status: "healthy", threshold: 100 },
    ];

    const mockServices: ServiceStatus[] = [
      {
        name: "Frontend (Next.js)",
        status: "online",
        uptime: "99.9%",
        responseTime: 120,
        lastCheck: new Date().toISOString()
      },
      {
        name: "Backend API",
        status: "online", 
        uptime: "99.8%",
        responseTime: 85,
        lastCheck: new Date().toISOString()
      },
      {
        name: "Database (Supabase)",
        status: "online",
        uptime: "99.9%",
        responseTime: 45,
        lastCheck: new Date().toISOString()
      },
      {
        name: "SSL Certificate",
        status: "online",
        uptime: "100%",
        responseTime: 0,
        lastCheck: new Date().toISOString()
      }
    ];

    setMetrics(mockMetrics);
    setServices(mockServices);
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      healthy: "default",
      warning: "secondary",
      degraded: "secondary",
      offline: "destructive",
      critical: "destructive"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor system performance and service status</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          <Button onClick={loadSystemHealth} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-2xl font-bold text-green-600">Healthy</span>
              </div>
              <p className="text-sm text-gray-600">Overall Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <p className="text-sm text-gray-600">Services Online</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Metrics</span>
          </CardTitle>
          <CardDescription>Real-time system resource usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {metric.name === "CPU Usage" && <Cpu className="h-4 w-4" />}
                    {metric.name === "Memory Usage" && <Memory className="h-4 w-4" />}
                    {metric.name === "Disk Usage" && <HardDrive className="h-4 w-4" />}
                    {metric.name === "Network I/O" && <Wifi className="h-4 w-4" />}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-mono">
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0{metric.unit}</span>
                    <span>Threshold: {metric.threshold}{metric.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Service Status</span>
          </CardTitle>
          <CardDescription>Status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">
                      Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Uptime: {service.uptime}</div>
                    <div className="text-sm text-gray-600">
                      Response: {service.responseTime}ms
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>System events and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">All services operational</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Activity className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">System health check completed</p>
                <p className="text-xs text-gray-600">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Disk usage above 75%</p>
                <p className="text-xs text-gray-600">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}