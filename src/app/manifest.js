import { site } from "../lib/site";

export default function manifest() {
  return {
    name: site.name,
    short_name: "SRH Codes",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#10243a",
    icons: [
      {
        src: "/brand/srh-logo.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
