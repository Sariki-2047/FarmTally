"use client";

import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Building2, 
  Truck,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

// Mock data - in a real app, this would come from an API
const recentActivities = [
  {
    id: 1,
    type: "user_registered",
    title: "New Farm Admin Registration",
    description: "John Smith registered for Green Valley Farms",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: UserPlus,
    status: "pending",
  },
  {
    id: 2,
    type: "user_approved",
    title: "Farm Admin Approved",
    description: "Sarah Johnson from Harvest Co. was approved",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: UserCheck,
    status: "success",
  },
  {
    id: 3,
    type: "organization_created",
    title: "New Organization",
    description: "Midwest Grain Corp was created",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    icon: Building2,
    status: "info",
  },
  {
    id: 4,
    type: "user_rejected",
    title: "Farm Admin Rejected",
    description: "Registration for ABC Farms was rejected",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    icon: UserX,
    status: "error",
  },
  {
    id: 5,
    type: "delivery_completed",
    title: "Large Delivery Processed",
    description: "5,000 kg delivery completed by Prairie Farms",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    icon: Truck,
    status: "success",
  },
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

const iconColors = {
  pending: "text-yellow-600",
  success: "text-green-600",
  error: "text-red-600",
  info: "text-blue-600",
};

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {recentActivities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-full bg-gray-100`}>
              <Icon className={`h-4 w-4 ${iconColors[activity.status as keyof typeof iconColors]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <Badge 
                  variant="secondary" 
                  className={statusColors[activity.status as keyof typeof statusColors]}
                >
                  {activity.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {format(activity.timestamp, 'MMM dd, yyyy • h:mm a')}
              </p>
            </div>
          </div>
        );
      })}
      
      {recentActivities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
}