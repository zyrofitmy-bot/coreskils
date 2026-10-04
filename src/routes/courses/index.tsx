import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CourseCard } from "@/components/CourseCard";
import { listCourses, listCategories } from "@/lib/marketplace.functions";

const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => listCourses({ data: {} }),
});
const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export const Route = createFileRoute("/courses/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(coursesQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
  },
  head: () => ({
    meta: [
      { title: "Courses — CoreSkils" },
      { name: "description", content: "Browse practical courses from CoreSkils creators." },
      { property: "og:title", content: "Courses — CoreSkils" },
      { property: "og:description", content: "Browse practical courses from CoreSkils creators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { data: courses } = useSuspenseQuery(coursesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [category, setCategory] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = courses.filter(
    (c: any) =>
      (!category || c.categories?.slug === category) &&
      (!q || c.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-4xl font-bold text-foreground">Courses</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Structured, practical learning from creators who do the work.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses…"
            className="rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => setCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === c.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No courses found. Check back soon — new content is added regularly.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c: any) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
