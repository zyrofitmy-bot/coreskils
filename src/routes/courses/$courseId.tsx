import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, Check, ChevronDown, Star } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getCourse } from "@/lib/marketplace.functions";
import { enrollInCourse, addReview } from "@/lib/account.functions";
import { formatPrice, formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

const courseQuery = (id: string) =>
  queryOptions({
    queryKey: ["course", id],
    queryFn: () => getCourse({ data: { id } }),
  });

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(courseQuery(params.courseId)),
  head: () => ({
    meta: [
      { title: "Course — CoreSkils" },
      { name: "description", content: "Course details on CoreSkils." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const { data: course } = useSuspenseQuery(courseQuery(courseId));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [enrolling, setEnrolling] = useState(false);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");

  if (!course) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Link to="/courses" className="mt-4 inline-block text-primary hover:underline">
            Browse all courses
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const lessonCount = course.modules.reduce(
    (n: number, m: any) => n + (m.lessons?.length ?? 0),
    0,
  );
  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((s: number, r: any) => s + r.rating, 0) / course.reviews.length
      : null;

  async function handleEnroll() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate({ to: "/auth" });
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse({ data: { courseId: course!.id } });
      toast.success("You're enrolled! Find it in your dashboard.");
      navigate({ to: "/dashboard/student" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not enroll");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleReview() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate({ to: "/auth" });
      return;
    }
    try {
      await addReview({
        data: { courseId: course!.id, rating, body: reviewBody || undefined },
      });
      toast.success("Review submitted");
      setReviewBody("");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    } catch (e: any) {
      toast.error(e.message ?? "Could not submit review");
    }
  }

  return (
    <PublicLayout>
      <section className="bg-secondary/50 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_360px]">
          <div>
            {course.categories?.name && (
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                {course.categories.name}
              </span>
            )}
            <h1 className="mt-2 text-4xl font-bold text-foreground">{course.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{course.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize">{course.level} level</span>
              <span>{lessonCount} lessons</span>
              {avgRating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-action text-action" />
                  {avgRating.toFixed(1)} ({course.reviews.length} reviews)
                </span>
              )}
            </div>
            {course.creator && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {course.creator.display_name?.[0] ?? "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {course.creator.display_name}
                  </p>
                  {course.creator.username && (
                    <Link
                      to="/creators/$username"
                      params={{ username: course.creator.username }}
                      className="text-xs text-primary hover:underline"
                    >
                      View creator profile
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="aspect-video overflow-hidden rounded-xl bg-secondary">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="size-10 text-primary/40" />
                </div>
              )}
            </div>
            <p className="mt-5 text-3xl font-bold text-foreground">
              {formatPrice(course.price_minor, course.currency)}
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-4 w-full rounded-full bg-action py-3 text-base font-semibold text-action-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {enrolling ? "Enrolling…" : "Enroll now"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-[1fr_360px]">
          <div className="space-y-12">
            {course.outcomes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground">What you'll learn</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {course.outcomes.map((o: string) => (
                    <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">Curriculum</h2>
              <div className="mt-4 space-y-3">
                {course.modules.map((m: any, i: number) => (
                  <div key={m.id} className="rounded-xl border border-border bg-card">
                    <button
                      onClick={() => setOpenModule(openModule === m.id ? null : m.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-card-foreground">
                        {i + 1}. {m.title}
                      </span>
                      <ChevronDown
                        className={`size-4 transition-transform ${openModule === m.id ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openModule === m.id && (
                      <ul className="border-t border-border px-5 py-3">
                        {(m.lessons ?? [])
                          .sort((a: any, b: any) => a.position - b.position)
                          .map((l: any) => (
                            <li
                              key={l.id}
                              className="flex items-center justify-between py-2 text-sm text-muted-foreground"
                            >
                              <span>{l.title}</span>
                              {l.is_preview && (
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                  Preview
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
              <div className="mt-4 space-y-4">
                {course.reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}
                {course.reviews.map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${i < r.rating ? "fill-action text-action" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {r.profiles?.name ?? "Learner"}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    </div>
                    {r.body && <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-card-foreground">Write a review</h3>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setRating(i + 1)}>
                      <Star
                        className={`size-6 ${i < rating ? "fill-action text-action" : "text-border"}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share your experience…"
                  className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
                <button
                  onClick={handleReview}
                  className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Submit review
                </button>
              </div>
            </div>
          </div>
          <div />
        </div>
      </section>
    </PublicLayout>
  );
}
