import {
  BarChart3,
  Bike,
  Fuel,
  LayoutDashboard,
  ReceiptText,
  Route,
  Settings2,
  ShieldCheck,
  Truck,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  icon: LucideIcon;
  /** Present for leaf links. Groups (with `children`) omit this and just toggle. */
  href?: string;
  /** When set, the item is shown only if the user holds every listed permission. */
  permissions?: string[];
  /** Present for expandable groups. */
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Fleet Ops",
    icon: Truck,
    children: [
      {
        title: "Vehicles",
        href: "/vehicles",
        icon: Bike,
      },
      {
        title: "Drivers",
        href: "/drivers",
        icon: User,
      },
      {
        title: "Trips",
        href: "/trips",
        icon: Route,
      },
      {
        title: "Maintenance",
        href: "/maintenance",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Finance & Ops",
    icon: ReceiptText,
    children: [
      {
        title: "Fuel Logs",
        href: "/fuel-logs",
        icon: Fuel,
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: ReceiptText,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: ShieldCheck,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings2,
      },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      {
        title: "Users",
        href: "/users",
        icon: User,
        permissions: ["users:read"],
      },
      {
        title: "Roles",
        href: "/roles",
        icon: ShieldCheck,
        permissions: ["roles:read"],
      },
    ],
  },
];
