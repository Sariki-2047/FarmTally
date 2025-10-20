"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Building2, 
  Users, 
  UserCheck, 
  AlertCircle,
  Settings,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    exact: true,
  },
  {
    name: "Pending Approvals",
    href: "/admin/approvals",
    icon: UserCheck,
    badge: "3",
    badgeVariant: "destructive" as const,
  },
  {
    name: "Farm Admins",
    href: "/admin/farm-admins",
    icon: Users,
  },
  {
    name: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    name: "System Health",
    href: "/admin/system",
    icon: AlertCircle,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant={item.badgeVariant || "secondary"} className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}