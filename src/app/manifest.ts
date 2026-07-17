import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareerForge by SoftBridge",
    short_name: "CareerForge",
    description: "Bilingual resume analysis and career workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F3ED",
    theme_color: "#1E5A64",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
