import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/components/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — CoreSkils" },
      { name: "description", content: "CoreSkils terms of service." },
      { property: "og:title", content: "Terms of Service — CoreSkils" },
      { property: "og:description", content: "CoreSkils terms of service." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});
