import Link from "next/link";
import { listPublishedCourses } from "@/lib/data/courses";

export default async function HomePage() {
  const courses = (await listPublishedCourses()).slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-slate-50 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            🎓 心禾學苑 · 線上課程平台
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            用自己的步調，
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              學會真正用得上的技能
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            歡迎來到心禾學苑：瀏覽課程、註冊會員、完成購買、觀看影片、追蹤學習進度，一氣呵成。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
            >
              瀏覽課程
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
            >
              免費註冊
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8 text-left sm:gap-8">
            {[
              { icon: "🎬", label: "隨時隨地觀看影片課程" },
              { icon: "📈", label: "自動追蹤學習進度" },
              { icon: "🔐", label: "購買後立即開通權限" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
                <span className="text-xl">{f.icon}</span>
                <dd className="text-xs text-slate-500 sm:text-sm">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">精選課程</h2>
            <p className="mt-1 text-sm text-slate-500">挑一門課，開始你的學習旅程</p>
          </div>
          <Link
            href="/courses"
            className="hidden text-sm font-medium text-indigo-600 hover:underline sm:block"
          >
            查看所有課程 →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <div
                  className="h-full w-full bg-slate-200 bg-cover bg-center transition duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${course.cover_image})` }}
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-indigo-600 shadow-sm">
                  NT$ {course.price.toLocaleString()}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{course.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
