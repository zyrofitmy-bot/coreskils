import { CourseBuilder } from "../creator/CourseBuilder";
import { useParams } from "@tanstack/react-router";

export function AdminCourseStudio({ productId }: { productId?: number }) {
  const params = useParams({ strict: false }) as any;
  const id = productId || (params.id ? Number(params.id) : undefined);

  if (!id) {
    return (
      <div className="p-12 text-center text-destructive">
        Course ID is missing.
      </div>
    );
  }

  return (
    <CourseBuilder 
      productId={id} 
      backRoute="/dashboard/admin" 
      backLabel="Admin Course Studio"
      role="admin"
    />
  );
}
