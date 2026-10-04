import { createFileRoute } from "@tanstack/react-router";
import { ShippingDeliveryPage } from "@/components/legal";

export const Route = createFileRoute("/shipping-delivery")({
  head: () => ({
    meta: [
      { title: "Digital Delivery Policy — CoreSkils" },
      { name: "description", content: "How CoreSkils delivers digital courses and products after purchase." },
      { property: "og:title", content: "Digital Delivery Policy — CoreSkils" },
      { property: "og:description", content: "How CoreSkils delivers digital courses and products after purchase." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShippingDeliveryPage,
});
