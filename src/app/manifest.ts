import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PHOENIX Seismo Venezuela",
    short_name: "PHOENIX Seismo",
    description:
      "Venezuela-focused earthquake monitoring with real-time public seismic data and local browser alerts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#061827",
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
