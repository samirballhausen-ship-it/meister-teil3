"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Brain, UserCircle2, Sun, Moon, Gamepad2, Compass, LogIn } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/",          icon: Home,      label: "Start" },
  { href: "/lernen",    icon: BookOpen,  label: "Lernen" },
  { href: "/pruefung",  icon: Brain,     label: "Prüfung" },
  { href: "/atlas",     icon: Compass,   label: "Atlas" },
  { href: "/pause",     icon: Gamepad2,  label: "Pause" },
];

export function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = theme === "dark" || theme === "system";

  return (
    <>
      <nav className="hidden md:block sticky top-0 z-40 backdrop-blur-xl bg-background/75 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-5 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="gravur text-sm font-semibold text-primary">M</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Meister-Atelier</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">Teil III</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/profil"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname.startsWith("/profil") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <UserCircle2 className="h-4 w-4" />
              <span>Profil</span>
            </Link>

            {/* Auth-Indicator */}
            {!loading && (
              user && !user.isGuest ? (
                <Link href="/profil" className="ml-2 h-9 w-9 rounded-lg border border-accent/40 bg-accent/10 overflow-hidden flex items-center justify-center" title={user.email ?? user.displayName ?? "Eingeloggt"}>
                  {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : <span className="gravur text-xs font-semibold text-accent">{(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}</span>}
                </Link>
              ) : (
                <Link href="/login" className="ml-2 h-9 px-3 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 flex items-center gap-1.5 text-xs">
                  <LogIn className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary">{user?.isGuest ? "Anmelden" : "Login"}</span>
                </Link>
              )
            )}

            {mounted && (
              <button
                onClick={() => setTheme(dark ? "light" : "dark")}
                className="ml-2 h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
                aria-label="Theme toggle"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-background/90 border-t border-border/60 safe-area-pb">
        <div className="flex items-center justify-around px-1 pt-1.5 pb-1.5">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_oklch(0.65_0.14_160_/_0.8)]" : ""}`} />
                <span className="text-[9px] uppercase tracking-wider font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/profil"
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith("/profil") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <UserCircle2 className={`h-5 w-5 ${pathname.startsWith("/profil") ? "drop-shadow-[0_0_6px_oklch(0.65_0.14_160_/_0.8)]" : ""}`} />
            <span className="text-[9px] uppercase tracking-wider font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
