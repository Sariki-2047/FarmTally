"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  urgent?: boolean;
}

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  description,
  urgent = false,
}: AdminStatsCardProps) {
  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      urgent && "border-red-200 bg-red-50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              urgent ? "text-red-600" : "text-gray-600"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl font-bold",
              urgent ? "text-red-900" : "text-gray-900"
            )}>
              {value.toLocaleString()}
            </p>
            {description && (
              <p className={cn(
                "text-xs",
                urgent ? "text-red-600" : "text-gray-500"
              )}>
                {description}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full",
            urgent ? "bg-red-100" : "bg-gray-100"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              urgent ? "text-red-600" : "text-gray-600"
            )} />
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <Badge 
              variant={urgent ? "destructive" : trendUp ? "secondary" : "outline"}
              className={cn(
                "text-xs",
                !urgent && trendUp && "bg-green-100 text-green-800",
                !urgent && !trendUp && "bg-red-100 text-red-800"
              )}
            >
              {trend}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}