import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCourseChapters, isUserEnrolled } from "@/lib/data/courses";
import { getCurrentUser } from "@/lib/auth";
import PurchaseForm from "@/components/PurchaseForm";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ expired?: string }>;
}) {
  const { slug } = await params;
  const { expired } = await searchParams;
  const course = await getCourseBySlug(slug);
  if (!course || !course.is_published) notFound();

  const chapters = await getCourseChapters(course.id);
  const totalLessons = chapters.reduce((sum, c) => sum + c.lessons.length, 0);
  const user = await getCurrentUser();
  const enrolled = user ? await isUserEnrolled(user.id, course.id) : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {expired && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          你對這堂課的觀看效期已經到期了，請聯繫講師續約後即可繼續觀看。
        </div>
      )}
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-sm font-medium text-indigo-600">{course.subtitle}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {course.title}
          </h1>
          <div
            className="mt-6 h-64 w-full rounded-lg bg-slate-200 bg-cover bg-center"
            style={{ backgroundImage: `url(${course.cover_image})` }}
          />
          <div className="mt-6 space-y-2 text-slate-700">
            <p>{course.description}</p>
          </div>

          <h2 className="mt-10 mb-4 text-xl font-bold">課程大綱</h2>
          <p className="mb-4 text-sm text-slate-500">
            共 {chapters.length} 個章節、{totalLessons} 個單元
          </p>
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="rounded-lg border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-100 px-4 py-3 font-semibold">
                  {chapter.title}
                </div>
                <ul className="divide-y divide-slate-100">
                  {chapter.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between px-4 py-3 text-sm text-slate-600"
                    >
                      <span>
                        {lesson.title}
                        {lesson.is_preview ? (
                          <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                            試看
                          </span>
                        ) : null}
                      </span>
                      <span className="text-slate-400">
                        {lesson.duration_minutes} 分鐘
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="mt-10 mb-4 text-xl font-bold">關於講師</h2>
          <p className="text-slate-700">
            <span className="font-semibold">{course.instructor_name}</span>
            　{course.instructor_bio}
          </p>
        </div>

        <div>
          <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">
              NT$ {course.price.toLocaleString()}
            </p>
            <div className="mt-4">
              {enrolled ? (
                <Link
                  href={`/learn/${course.slug}`}
                  className="block w-full rounded-md bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700"
                >
                  已購買，前往學習
                </Link>
              ) : user ? (
                <PurchaseForm courseId={course.id} />
              ) : (
                <Link
                  href={`/login?next=/courses/${course.slug}`}
                  className="block w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
                >
                  登入後即可購買
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
