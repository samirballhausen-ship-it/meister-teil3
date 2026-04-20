import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.196", "localhost", "127.0.0.1"],
  turbopack: { root: __dirname },

  /**
   * Ohne `same-origin-allow-popups` blockt Chrome/Edge das Firebase-Auth-Popup.
   * Das war der Grund warum `signInWithPopup` auf teil3.clawbuis.com hängen blieb.
   * Teil-IV hat die identische Regel (dort funktioniert Google-Login).
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },

  /**
   * Firebase Auth same-origin proxy: kritisch für Custom-Domains.
   * Ohne diesen Proxy speichert Firebase die Auth-Session auf
   * `*.firebaseapp.com` — Browser blockieren 3rd-party-cookies →
   * getRedirectResult liefert nichts, User bleibt abgelogt.
   *
   * Mit diesem Proxy läuft der Auth-Handler auf der eigenen Domain,
   * Session-Tokens sind same-origin, alles funktioniert.
   */
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://meister-tischler-lernapp.firebaseapp.com/__/auth/:path*",
      },
      {
        source: "/__/firebase/:path*",
        destination: "https://meister-tischler-lernapp.firebaseapp.com/__/firebase/:path*",
      },
    ];
  },
};

export default nextConfig;
