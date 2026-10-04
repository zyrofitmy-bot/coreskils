import { createFileRoute } from "@tanstack/react-router";
import Courses from "@/components/pages/Courses";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — CoreSkils" },
      { name: "description", content: "Browse courses created and published by independent instructors on CoreSkils." },
    ],
  }),
  component: Courses,
});
