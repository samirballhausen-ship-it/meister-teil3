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
};

export default nextConfig;
