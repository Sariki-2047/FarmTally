"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function LocationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collection Locations</h1>
        <p className="text-gray-600">Manage your collection points and routes</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Locations Coming Soon</h3>
          <p className="text-gray-500 text-center">
            This feature will help you manage collection locations and optimize routes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}