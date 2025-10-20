"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Truck, 
  Users, 
  Package, 
  MapPin,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/field-manager", icon: Home },
  { name: "My Requests", href: "/field-manager/requests", icon: ClipboardList },
  { name: "Active Lorries", href: "/field-manager/lorries", icon: Truck },
  { name: "Farmers", href: "/field-manager/farmers", icon: Users },
  { name: "Deliveries", href: "/field-manager/deliveries", icon: Package },
  { name: "Locations", href: "/field-manager/locations", icon: MapPin },
  { name: "Reports", href: "/field-manager/reports", icon: BarChart3 },
  { name: "Settings", href: "/field-manager/settings", icon: Settings },
];

export function FieldManagerSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">FarmTally</h1>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">Field Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="space-y-2">
          <Link href="/field-manager/request-lorry" className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Truck className="mr-2 h-4 w-4" />
              Request Lorry
            </Button>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}