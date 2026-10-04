import { createFileRoute } from "@tanstack/react-router";
import About from "@/components/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CoreSkils" },
      { name: "description", content: "Learn about CoreSkils — practical digital products with transparent terms." },
    ],
  }),
  component: About,
});
