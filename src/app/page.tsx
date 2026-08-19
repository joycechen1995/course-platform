import Link from "next/link";
import { listPublishedCourses } from "@/lib/data/courses";

export default async function HomePage() {
  const courses = (await listPublishedCourses()).slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-to-b from-indigo-50 to-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            用自己的步調，學會真正用得上的技能
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            這是一個示範用的線上課程平台：瀏覽課程、註冊會員、完成購買、觀看影片、追蹤學習進度，一氣呵成。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              瀏覽課程
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-slate-300 bg-white px-6 py-3 text-slate-700 hover:bg-slate-100"
            >
              免費註冊
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">精選課程</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-40 w-full bg-slate-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${course.cover_image})` }}
              />
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{course.subtitle}</p>
                <p className="mt-3 font-bold text-indigo-600">
                  NT$ {course.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
