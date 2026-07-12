export interface NavItem {
  title: string;
  href: string;
  /** When set, the item is shown only if the user holds every listed permission. */
  permissions?: string[];
  /** Additional paths that should mark this item active. */
  activePaths?: string[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Fleet",
    href: "/vehicles",
    permissions: ["vehicles:read"],
  },
  {
    title: "Drivers",
    href: "/drivers",
  },
  {
    title: "Trips",
    href: "/trips",
  },
  {
    title: "Maintenance",
    href: "/maintenance",
  },
  {
    title: "Fuel & Expenses",
    href: "/fuel-logs",
    activePaths: ["/expenses"],
  },
  {
    title: "Analytics",
    href: "/analytics",
  },
  {
    title: "Settings",
    href: "/settings",
  },
  {
    title: "Users",
    href: "/users",
    permissions: ["users:read"],
  },
  {
    title: "Roles",
    href: "/roles",
    permissions: ["roles:read"],
  },
];
