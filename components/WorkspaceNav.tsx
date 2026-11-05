"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  HandCoins,
  Package,
  ShoppingCart,
  ChartNoAxesCombined,
  Settings2,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/debts", label: "Debt tracker", icon: HandCoins },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/reports", label: "Reports", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
export default function WorkspaceNav({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="workspace-navigation">
      <button
        className="mobile-menu btn"
        type="button"
        aria-expanded={open}
        aria-controls="workspace-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={19} /> : <Menu size={19} />}{" "}
        {open ? "Close menu" : "Menu"}
      </button>
      <nav
        id="workspace-nav"
        aria-label="Workspace"
        className={open ? "nav-open" : ""}
      >
        {(isAdmin
          ? [
              {
                href: "/admin",
                label: "Admin ? Customer overview",
                icon: Users,
              },
            ]
          : items
        ).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              pathname === href || pathname.startsWith(`${href}/`)
                ? "page"
                : undefined
            }
            onClick={() => setOpen(false)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {(pathname === href || pathname.startsWith(`${href}/`)) && (
              <span className="nav-dot" aria-hidden="true" />
            )}
          </Link>
        ))}
        {!isAdmin && (
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            aria-current={pathname === "/pricing" ? "page" : undefined}
          >
            <ArrowUpRight size={19} />
            <span>Explore plans</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
