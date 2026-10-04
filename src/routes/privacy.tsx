import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CoreSkils" },
      { name: "description", content: "CoreSkils privacy policy." },
      { property: "og:title", content: "Privacy Policy — CoreSkils" },
      { property: "og:description", content: "CoreSkils privacy policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});
