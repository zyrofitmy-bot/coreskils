import { createFileRoute } from "@tanstack/react-router";
import Home from "@/components/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoreSkils — The professional platform for digital knowledge" },
      {
        name: "description",
        content:
          "CoreSkils provides the infrastructure for experts to publish practical courses, downloadable files, and live learning experiences.",
      },
    ],
  }),
  component: Home,
});
