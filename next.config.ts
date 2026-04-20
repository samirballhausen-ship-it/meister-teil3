import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.196", "localhost", "127.0.0.1"],
  turbopack: { root: __dirname },

  /**
   * Cross-Origin-Opener-Policy für Firebase signInWithPopup.
   * Ohne `same-origin-allow-popups` blockt Chrome/Edge das Auth-Popup.
   * Identisch zu Teil-IV (dort funktioniert Google-Login einwandfrei).
   *
   * KEIN Auth-Proxy-Rewrite mehr nötig: signInWithPopup braucht keine
   * Cross-Domain-Session-Übertragung wie signInWithRedirect.
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
