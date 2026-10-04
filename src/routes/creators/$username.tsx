import { createFileRoute } from "@tanstack/react-router";
import CreatorProfile from "@/components/pages/CreatorProfile";

export const Route = createFileRoute("/creators/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} — CoreSkils Creator` },
      { name: "description", content: "View this creator's published courses and digital products on CoreSkils." },
    ],
  }),
  component: CreatorProfile,
});
