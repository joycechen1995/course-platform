import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourseBySlug,
  getCourseChapters,
  getLessonProgressSet,
  isUserEnrolled,
} from "@/lib/data/courses";
import { toggleLessonCompleteAction } from "@/lib/actions/learning";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/learn/${slug}`);

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  if (!(await isUserEnrolled(user.id, course.id))) {
    redirect(`/courses/${slug}`);
  }

  const chapters = await getCourseChapters(course.id);
  const allLessons = chapters.flatMap((c) => c.lessons);
  if (allLessons.length === 0) notFound();

  const currentLessonId = lessonParam
    ? Number(lessonParam)
    : allLessons[0].id;
  const currentLesson =
    allLessons.find((l) => l.id === currentLessonId) ?? allLessons[0];

  const progressSet = await getLessonProgressSet(
    user.id,
    allLessons.map((l) => l.id)
  );
  const completedCount = allLessons.filter((l) => progressSet.has(l.id)).length;
  const progressPercent = Math.round(
    (completedCount / allLessons.length) * 100
  );
  const isCompleted = progressSet.has(currentLesson.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-80">
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm text-slate-500 hover:underline"
        >
          ← {course.title}
        </Link>
        <div className="mt-3 mb-4">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>學習進度</span>
            <span>
              {completedCount}/{allLessons.length}（{progressPercent}%）
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="space-y-3">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 px-3 py-2 text-sm font-semibold">
                {chapter.title}
              </div>
              <ul className="divide-y divide-slate-100">
                {chapter.lessons.map((lesson) => {
                  const active = lesson.id === currentLesson.id;
                  const done = progressSet.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/learn/${course.slug}?lesson=${lesson.id}`}
                        className={`flex items-center gap-2 px-3 py-2 text-sm ${
                          active
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                            done
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {done ? "✓" : ""}
                        </span>
                        {lesson.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1">
        <div className="overflow-hidden rounded-lg bg-black">
          <video
            key={currentLesson.id}
            src={currentLesson.video_url}
            controls
            className="aspect-video w-full"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{currentLesson.title}</h1>
          <form action={toggleLessonCompleteAction}>
            <input type="hidden" name="lessonId" value={currentLesson.id} />
            <input type="hidden" name="courseSlug" value={course.slug} />
            <input type="hidden" name="complete" value={isCompleted ? "0" : "1"} />
            <button
              type="submit"
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                isCompleted
                  ? "border border-slate-300 text-slate-600 hover:bg-slate-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isCompleted ? "取消標記完成" : "標記為已完成"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
