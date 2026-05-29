import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Flow Money - Local-First Expense Tracker",
    short_name: "My Flow Money",
    description: "Track budgets, wallets, and spending trends offline with a privacy-first local expense tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f7fb",
    theme_color: "#2563eb",
    orientation: "portrait",
    icons: [
      {
        src: "/logo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
