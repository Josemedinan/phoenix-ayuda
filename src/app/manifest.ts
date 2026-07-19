import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PHOENIX Aid Venezuela",
    short_name: "PHOENIX Aid",
    description:
      "A private household plan, offline guide, and low-bandwidth request for people affected by the Venezuela earthquakes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0e8",
    theme_color: "#f5c95e",
    lang: "en",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
