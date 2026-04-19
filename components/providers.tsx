"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ProfileProvider } from "@/lib/profile-store";
import { ProgressProvider } from "@/lib/progress-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
      <AuthProvider>
        <ProfileProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
