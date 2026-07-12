"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";
import { navItems, type NavItem } from "@/components/layout/nav-items";

function isItemActive(item: NavItem, pathname: string): boolean {
  const paths = [item.href, ...(item.activePaths ?? [])];
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Drops items the user lacks permission for. */
function filterVisible(items: NavItem[], hasPermission: (...p: string[]) => boolean): NavItem[] {
  return items.filter((item) => !item.permissions || hasPermission(...item.permissions));
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const visibleItems = React.useMemo(
    () => filterVisible(navItems, hasPermission),
    [hasPermission]
  );

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const active = isItemActive(item, pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm ring-1 ring-sidebar-ring/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
