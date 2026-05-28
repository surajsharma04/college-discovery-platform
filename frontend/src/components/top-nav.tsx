"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bookmark,
  Brain,
  Compass,
  GitCompareArrows,
  LogOut,
  LogIn,
  Menu,
  MessageSquareMore,
  X
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Magnetic } from "@/components/magnetic";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/predictor", label: "Predictor", icon: Brain },
  { href: "/discussion", label: "Discussion", icon: MessageSquareMore },
  { href: "/saved", label: "Saved", icon: Bookmark }
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-30">
      <div className="nav-shell flex w-full flex-col gap-3 rounded-[1.75rem] border px-4 py-3 shadow-[0_18px_60px_var(--shadow-soft)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Magnetic strength={8}>
            <Link href="/" className="brand-mark inline-flex items-center gap-3 text-lg font-bold tracking-tight text-[var(--ink-900)]">
              <span className="brand-dot" />
              Campus Compass
            </Link>
          </Magnetic>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="nav-menu-toggle inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className={`${menuOpen ? "flex" : "hidden"} nav-mobile-panel flex-col gap-2 md:flex md:flex-row md:items-center md:justify-center md:gap-2`}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Magnetic key={item.href} strength={12}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-pill flex items-center gap-2 rounded-full px-4 py-2 text-sm transition md:shrink-0 ${
                    active ? "nav-pill-active" : "text-[var(--ink-700)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Magnetic>
            );
          })}
        </nav>
        <div className={`${menuOpen ? "flex" : "hidden"} nav-actions flex-col gap-2 md:flex md:flex-row md:items-center md:self-auto`}>
          {loading ? (
            <span className="text-sm text-[var(--ink-600)]">Checking session...</span>
          ) : user ? (
            <>
              <span className="text-sm text-[var(--ink-700)] md:inline">
                {user.name}
              </span>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full px-3 py-2 md:w-auto md:py-1.5"
                onClick={async () => {
                  await logout();
                  setMenuOpen(false);
                  router.push("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMenuOpen(false)}
              className="nav-auth-chip flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm md:w-auto"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
