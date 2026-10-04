import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PlayCircle, MonitorPlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMyEnrolledCourse } from "@/lib/account.functions";

// TODO(phase2): live classes and secure streaming are not ported yet (LiveKit/upload infra).
export function StudentCoursePlayer({ courseId }: { courseId: string }) {
  const { data: course, isLoading } = useQuery({
    queryKey: ["enrolled-course", courseId],
    queryFn: () => getMyEnrolledCourse({ data: { courseId } }),
  });
  const lessons = useMemo(() => course?.modules?.flatMap((m: any) => m.lessons ?? []) ?? [], [course]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLessonId && lessons.length) setSelectedLessonId(lessons[0].id);
  }, [lessons, selectedLessonId]);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center border border-[#E5E5E5] bg-white rounded-xl shadow-sm">
        <h2 className="text-[24px] font-bold text-black">Course unavailable</h2>
        <p className="mt-2 text-[15px] text-[#4D4D4D]">You must be enrolled to open this learning area.</p>
        <Link to="/dashboard/student" className="mt-8 h-11 px-6 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)] inline-flex items-center justify-center">Back to My Learning </Link>
      </div>
    );
  }

  const selectedLesson = lessons.find((l: any) => l.id === selectedLessonId) ?? lessons[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pt-4">
      <div className="flex items-start gap-4">
        <Link to="/dashboard/student" aria-label="Back to My Learning" className="h-10 w-10 border border-[#E5E5E5] bg-white text-[#394649] hover:bg-gray-50 inline-flex items-center justify-center rounded-md">
          <ArrowLeft className="h-5 w-5" />
         </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] md:text-[32px] font-bold text-black tracking-tight leading-tight">{course.title}</h1>
            <Badge className="bg-[#E3F9EF] text-primary border-none shadow-none font-bold uppercase tracking-wider text-[10px]">Enrolled</Badge>
          </div>
          <p className="mt-1 text-[14px] text-[#4D4D4D]">Your enrolled course</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-black shadow-sm">
            <div className="aspect-video relative flex items-center justify-center text-white/70">
              {/* TODO(phase2): secure video playback isn't ported; placeholder shown instead. */}
              <MonitorPlay className="h-12 w-12" />
            </div>
          </div>
          {selectedLesson && (
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
              <h2 className="text-[20px] font-bold text-black">{selectedLesson.title}</h2>
              {selectedLesson.description && <p className="mt-2 text-[14px] text-[#4D4D4D]">{selectedLesson.description}</p>}
            </div>
          )}
        </main>
        <aside className="space-y-3">
          {course.modules?.map((module: any) => (
            <div key={module.id} className="rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-[14px] font-bold text-black">{module.title}</h3>
              <ul className="space-y-1">
                {(module.lessons ?? []).map((lesson: any) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] ${selectedLessonId === lesson.id ? "bg-[#E3F9EF] text-primary font-semibold" : "text-[#394649] hover:bg-gray-50"}`}
                    >
                      <PlayCircle className="h-4 w-4 shrink-0" />
                      {lesson.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
