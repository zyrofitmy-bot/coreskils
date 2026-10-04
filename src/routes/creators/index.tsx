import { createFileRoute } from "@tanstack/react-router";
import Creators from "@/components/pages/Creators";

export const Route = createFileRoute("/creators/")({
  head: () => ({
    meta: [
      { title: "Teach on CoreSkils — For Instructors" },
      { name: "description", content: "Create your course, reach new learners, and teach your way on CoreSkils." },
    ],
  }),
  component: Creators,
});
