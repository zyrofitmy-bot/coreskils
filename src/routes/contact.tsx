import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/legal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CoreSkils" },
      { name: "description", content: "Get in touch with the CoreSkils team." },
      { property: "og:title", content: "Contact — CoreSkils" },
      { property: "og:description", content: "Get in touch with the CoreSkils team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});
