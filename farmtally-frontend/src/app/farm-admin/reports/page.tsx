"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
          <p className="text-gray-500 text-center">
            Detailed business reports, analytics, and insights will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}