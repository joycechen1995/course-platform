import Link from "next/link";
import { listPublishedCourses } from "@/lib/data/courses";

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">所有課程</h1>
      <p className="mb-8 text-sm text-slate-500">共 {courses.length} 門課程</p>
      {courses.length === 0 ? (
        <p className="text-slate-500">目前還沒有上架的課程。</p>
      ) : (
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
      )}
    </div>
  );
}
