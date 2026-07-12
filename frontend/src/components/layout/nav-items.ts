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
    permissions: ["drivers:read"],
  },
  {
    title: "Trips",
    href: "/trips",
    permissions: ["trips:read"],
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    permissions: ["maintenance:read"],
  },
  {
    title: "Fuel & Expenses",
    href: "/fuel-logs",
    activePaths: ["/expenses"],
    permissions: ["fuel:read"],
  },
  {
    title: "Analytics",
    href: "/analytics",
    permissions: ["reports:read"],
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
