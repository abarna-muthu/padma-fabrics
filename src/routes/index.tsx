import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Padmanabha Fabrics | A World of Beautiful Fabrics · Chennai" },
      {
        name: "description",
        content:
          "Explore silks, cottons, coordsets and ready-to-wear at Padmanabha Fabrics, Menambedu, Ambattur, Chennai. Retail · Wholesale · Import & Export.",
      },
      { property: "og:title", content: "Padmanabha Fabrics | A World of Beautiful Fabrics · Chennai" },
      {
        property: "og:description",
        content:
          "Fine fabrics, thoughtfully selected. Explore the Padmanabha Fabrics collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
