"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      console.log('🔍 Login attempt:', data.email);
      await login(data);
      console.log('✅ Login successful');
      
      // Get the user from auth store to determine redirect
      const { user, isAuthenticated } = useAuthStore.getState();
      console.log('👤 User after login:', user);
      console.log('🔐 Authenticated:', isAuthenticated);
      
      toast.success("Login successful!");
      
      // Redirect based on user role
      if (user?.role === "APPLICATION_ADMIN") {
        console.log('🚀 Redirecting to /admin');
        router.push("/admin");
      } else if (user?.role === "FARM_ADMIN") {
        console.log('🚀 Redirecting to /farm-admin');
        router.push("/farm-admin");
      } else if (user?.role === "FIELD_MANAGER") {
        console.log('🚀 Redirecting to /field-manager');
        router.push("/field-manager");
      } else if (user?.role === "FARMER") {
        console.log('🚀 Redirecting to /farmer');
        router.push("/farmer");
      } else {
        console.log('🚀 Redirecting to home (no role match)');
        router.push("/");
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">FarmTally</h1>
          <p className="mt-2 text-sm text-gray-600">
            Corn Procurement Management System
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="mt-1"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}