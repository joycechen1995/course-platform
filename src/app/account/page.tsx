import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserEnrolledCourses } from "@/lib/data/courses";

export default async function AccountPage() {
  const user = await getCurrentUser();
  const courses = user ? await getUserEnrolledCourses(user.id) : [];

  return (
    <div>
      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          你還沒有購買任何課程。
          <div className="mt-4">
            <Link
              href="/courses"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              去逛逛課程
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/learn/${course.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-32 w-full bg-slate-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${course.cover_image})` }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-indigo-600">繼續學習 →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
