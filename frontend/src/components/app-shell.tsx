"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { Magnetic } from "@/components/magnetic";
import { TopNav } from "@/components/top-nav";

type AppShellProps = {
  children: React.ReactNode;
};

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem("campus-compass-theme");
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolvePageTheme(pathname: string) {
  if (pathname.startsWith("/compare")) return "compare";
  if (pathname.startsWith("/predictor")) return "predictor";
  if (pathname.startsWith("/discussion")) return "discussion";
  if (pathname.startsWith("/saved")) return "saved";
  if (pathname.startsWith("/auth")) return "auth";
  if (pathname.startsWith("/colleges")) return "detail";
  return "discover";
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const pageTheme = useMemo(() => resolvePageTheme(pathname), [pathname]);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.mode = themeMode;
    document.documentElement.dataset.page = pageTheme;
    window.localStorage.setItem("campus-compass-theme", themeMode);
  }, [pageTheme, themeMode]);

  return (
    <AuthProvider>
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-50 -translate-y-20 rounded-xl bg-[var(--solid-bg)] px-4 py-2 text-sm text-[var(--solid-fg)] transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="page-shell min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="page-aura page-aura-one" />
          <div className="page-aura page-aura-two" />
          <div className="page-aura page-aura-three" />
          <div className="page-noise" />
        </div>

        <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 pb-8 pt-5 md:px-8">
          <div className="mb-4 flex justify-end">
            <Magnetic strength={10}>
              <button
                type="button"
                aria-label={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
                onClick={() => setThemeMode((current) => (current === "light" ? "dark" : "light"))}
                className="theme-toggle inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
              >
                {themeMode === "light" ? (
                  <>
                    <MoonStar className="h-4 w-4" />
                    Dark mode
                  </>
                ) : (
                  <>
                    <SunMedium className="h-4 w-4" />
                    Light mode
                  </>
                )}
              </button>
            </Magnetic>
          </div>

          <TopNav />

          <div
            id="main-content"
            className="relative mt-5 flex w-full flex-1 rounded-[2rem] border border-[var(--line)]/80 bg-[var(--shell)]/80 px-4 py-5 shadow-[0_30px_120px_var(--shadow-strong)] backdrop-blur-xl md:px-7 md:py-7"
          >
            {children}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
