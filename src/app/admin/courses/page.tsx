import Link from "next/link";
import { listAllCourses } from "@/lib/data/courses";
import { togglePublishAction } from "@/lib/actions/admin";

export default async function AdminCoursesPage() {
  const courses = await listAllCourses();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">課程管理</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          + 新增課程
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">課程名稱</th>
              <th className="px-4 py-3">價格</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="px-4 py-3">NT$ {course.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      course.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {course.is_published ? "已上架" : "未上架"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={togglePublishAction}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <button className="text-indigo-600 hover:underline">
                      {course.is_published ? "下架" : "上架"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
