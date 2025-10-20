"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [apiTest, setApiTest] = useState<string>("Not tested");
  const { user, isAuthenticated, token, checkAuth } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  const testAPI = async () => {
    try {
      setApiTest("Testing...");
      const response = await fetch("http://localhost:9999/health");
      const data = await response.json();
      setApiTest(`Success: ${data.message}`);
    } catch (error) {
      setApiTest(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">FarmTally Debug Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Authenticated:</span>
                <span className={isAuthenticated ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {isAuthenticated ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>User Role:</span>
                <span className="font-semibold">
                  {user?.role || "None"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>User Email:</span>
                <span className="font-semibold">
                  {user?.email || "None"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Token Present:</span>
                <span className={token ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {token ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>User Status:</span>
                <span className="font-semibold">
                  {user?.status || "None"}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500">Full User Object:</span>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frontend Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>React Hydration:</span>
                <span className="text-green-600 font-semibold">✅ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Components:</span>
                <span className="text-green-600 font-semibold">✅ Working</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tailwind CSS:</span>
                <span className="text-green-600 font-semibold">✅ Loaded</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>API Status:</span>
                <span className={apiTest.includes("Success") ? "text-green-600" : apiTest.includes("Error") ? "text-red-600" : "text-gray-600"}>
                  {apiTest}
                </span>
              </div>
              <Button onClick={testAPI} className="w-full">
                Test Backend Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a href="/" className="block">
                <Button variant="outline" className="w-full">
                  Home Page
                </Button>
              </a>
              <a href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Login Page
                </Button>
              </a>
              <a href="/register" className="block">
                <Button variant="outline" className="w-full">
                  Register Page
                </Button>
              </a>
              <a href="/admin" className="block">
                <Button variant="outline" className="w-full">
                  Admin Dashboard
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Frontend URL:</strong> http://localhost:3001</div>
              <div><strong>Backend URL:</strong> http://localhost:9999</div>
              <div><strong>Environment:</strong> Development</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}