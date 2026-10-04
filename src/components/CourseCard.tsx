import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/format";

export function CourseCard({ course }: { course: any }) {
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.slug ?? course.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-video bg-secondary">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-10 text-primary/40" />
          </div>
        )}
      </div>
      <div className="p-5">
        {course.categories?.name && (
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {course.categories.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-card-foreground group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-bold text-foreground">
            {formatPrice(course.price_minor, course.currency)}
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  );
}
