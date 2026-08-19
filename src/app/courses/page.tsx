import Link from "next/link";
import { listPublishedCourses } from "@/lib/data/courses";

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">所有課程</h1>
      {courses.length === 0 ? (
        <p className="text-slate-500">目前還沒有上架的課程。</p>
      ) : (
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
      )}
    </div>
  );
}
