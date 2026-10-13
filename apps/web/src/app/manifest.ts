import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lumen - świece zapachowe premium",
    short_name: "Lumen",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e9",
    theme_color: "#15110d",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
