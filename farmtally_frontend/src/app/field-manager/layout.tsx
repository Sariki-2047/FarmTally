"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { FieldManagerSidebar } from "@/components/field-manager/field-manager-sidebar";

export default function FieldManagerLayout({
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
    } else if (isAuthenticated && user?.role !== "FIELD_MANAGER") {
      router.push("/");
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading || (!isAuthenticated && localStorage.getItem('farmtally_token'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Let the useEffect handle the redirect
  }

  if (user?.role !== "FIELD_MANAGER") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600">You need Field Manager privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <FieldManagerSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}