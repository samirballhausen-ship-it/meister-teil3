import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", axes: ["SOFT", "WONK", "opsz"] });
const mono = JetBrains_Mono({ variable: "--font-mono-jet", subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#121e1a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f1e4" },
  ],
};

export const metadata: Metadata = {
  title: "Meister-Atelier · Teil III",
  description: "Dein Weg zur Meisterprüfung Teil III · Lernen, Prüfen, Bestehen.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Meister III" },
  other: { "mobile-web-app-capable": "yes" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
