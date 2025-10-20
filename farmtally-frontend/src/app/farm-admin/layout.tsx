"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { FarmAdminSidebar } from "@/components/farm-admin/farm-admin-sidebar";

export default function FarmAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth if we have a token but no user data
    const token = localStorage.getItem('farmtally_token');
    if (token && !user && !isLoading) {
      checkAuth();
    }
  }, [checkAuth, user, isLoading]);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated && user?.role !== "FARM_ADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || (!isAuthenticated && localStorage.getItem('farmtally_token'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Let the useEffect handle the redirect
  }

  if (user?.role !== "FARM_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600">You need Farm Admin privileges to access this area.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Current role: {user?.role || "None"}</p>
            <p>Status: {user?.status || "None"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <FarmAdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}