import { createFileRoute } from "@tanstack/react-router";
import { RefundPage } from "@/components/legal";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — CoreSkils" },
      { name: "description", content: "CoreSkils refund policy." },
      { property: "og:title", content: "Refund Policy — CoreSkils" },
      { property: "og:description", content: "CoreSkils refund policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPage,
});
