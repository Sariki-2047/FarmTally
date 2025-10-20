"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "APPLICATION_ADMIN":
          router.replace("/admin");
          break;
        case "FARM_ADMIN":
          router.replace("/farm-admin");
          break;
        case "FIELD_MANAGER":
          router.replace("/field-manager");
          break;
        case "FARMER":
          router.replace("/farmer");
          break;
        default:
          router.replace("/");
          break;
      }
    } else if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}