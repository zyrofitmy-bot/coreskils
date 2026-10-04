import { createFileRoute } from "@tanstack/react-router";
import Products from "@/components/pages/Products";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Digital Products — CoreSkils" },
      { name: "description", content: "Genuine downloadable resources with transparent pricing and clear deliverables." },
    ],
  }),
  component: Products,
});
