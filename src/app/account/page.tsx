import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserEnrolledCourses } from "@/lib/data/courses";
import { formatDateOnly, isPast } from "@/lib/format";

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
          {courses.map((course) => {
            const expired = isPast(course.expires_at);
            return (
              <Link
                key={course.id}
                href={expired ? `/courses/${course.slug}` : `/learn/${course.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative">
                  <div
                    className="h-32 w-full bg-slate-200 bg-cover bg-center"
                    style={{ backgroundImage: `url(${course.cover_image})` }}
                  />
                  {expired && (
                    <span className="absolute right-2 top-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                      已到期
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">
                    {course.title}
                  </h3>
                  {expired ? (
                    <p className="mt-2 text-sm text-rose-600">
                      觀看效期已於 {formatDateOnly(course.expires_at)} 到期，請聯繫講師續約
                    </p>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-indigo-600">繼續學習 →</p>
                      <p className="mt-1 text-xs text-slate-400">
                        觀看效期至 {formatDateOnly(course.expires_at)}
                      </p>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
