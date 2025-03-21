"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

// This will be replaced with real auth in the backend implementation
const useIsAdmin = () => {
  // For demo purposes, we'll use a state to toggle between admin and non-admin
  const [isAdmin, setIsAdmin] = useState(false);
  return { isAdmin, setIsAdmin };
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, setIsAdmin } = useIsAdmin();

  // Simplified navigation - just two routes
  const adminNavItems = [{ path: "/admin", label: "Grandparents Portal" }];

  const nonAdminNavItems = [{ path: "/", label: "Family Portal" }];

  const navItems = isAdmin ? adminNavItems : nonAdminNavItems;

  const handleSwitchView = () => {
    // Toggle the state for UI consistency
    setIsAdmin(!isAdmin);

    // Navigate to the appropriate route
    if (isAdmin) {
      // If currently in admin view, switch to family view
      router.push("/");
    } else {
      // If currently in family view, switch to admin view
      router.push("/admin");
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          Babysitting Planner
        </Link>
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-sm transition-colors hover:text-foreground/80",
                pathname === item.path
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleSwitchView}
            className="ml-4 px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80"
          >
            {isAdmin ? "Switch to Family View" : "Switch to Grandparents View"}
          </button>
        </div>
      </div>
    </nav>
  );
}
