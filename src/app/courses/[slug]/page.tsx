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
  const totalMinutes = chapters.reduce(
    (sum, c) => sum + c.lessons.reduce((s, l) => s + l.duration_minutes, 0),
    0
  );
  const user = await getCurrentUser();
  const enrolled = user ? await isUserEnrolled(user.id, course.id) : false;
  const highlights = course.highlights
    .split("\n")
    .map((h) => h.trim())
    .filter(Boolean);

  const PurchaseBox = (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
      <dl className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex justify-between">
          <dt>課程內容</dt>
          <dd>
            {chapters.length} 章節・{totalLessons} 單元
          </dd>
        </div>
        {totalMinutes > 0 && (
          <div className="flex justify-between">
            <dt>總時長</dt>
            <dd>約 {totalMinutes} 分鐘</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>觀看效期</dt>
          <dd>開通後 1 年</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        {course.cover_image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${course.cover_image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-20">
          {expired && (
            <div className="mb-6 rounded-md border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              你對這堂課的觀看效期已經到期了，請聯繫講師續約後即可繼續觀看。
            </div>
          )}
          {course.subtitle && (
            <p className="text-sm font-medium text-indigo-300">{course.subtitle}</p>
          )}
          <h1 className="mt-2 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
            {course.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
            <span>📚 {chapters.length} 個章節</span>
            <span>🎬 {totalLessons} 個單元</span>
            {course.instructor_name && <span>👤 {course.instructor_name}</span>}
            <span>🔓 開通後 1 年觀看效期</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {highlights.length > 0 && (
              <div className="mb-10 rounded-lg border border-slate-200 bg-indigo-50/50 p-6">
                <h2 className="mb-4 text-lg font-bold text-slate-900">
                  這堂課能學到什麼
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                        ✓
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.description && (
              <div className="mb-10">
                <h2 className="mb-3 text-xl font-bold text-slate-900">課程介紹</h2>
                <p className="whitespace-pre-line text-slate-700">
                  {course.description}
                </p>
              </div>
            )}

            <div>
              <h2 className="mb-1 text-xl font-bold text-slate-900">課程大綱</h2>
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
            </div>

            {(course.instructor_name || course.instructor_bio) && (
              <div className="mt-10">
                <h2 className="mb-4 text-xl font-bold text-slate-900">關於講師</h2>
                <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {course.instructor_photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.instructor_photo}
                        alt={course.instructor_name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {course.instructor_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {course.instructor_bio}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 rounded-lg bg-slate-900 px-6 py-8 text-center sm:hidden">
              <p className="text-lg font-semibold text-white">準備好開始了嗎？</p>
              <p className="mt-1 text-2xl font-bold text-white">
                NT$ {course.price.toLocaleString()}
              </p>
              <div className="mt-4">
                {enrolled ? (
                  <Link
                    href={`/learn/${course.slug}`}
                    className="block w-full rounded-md bg-emerald-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-600"
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

          <div className="hidden sm:block">
            <div className="sticky top-6">{PurchaseBox}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
