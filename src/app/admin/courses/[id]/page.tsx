import { notFound } from "next/navigation";
import { getCourseById, getCourseChapters } from "@/lib/data/courses";
import {
  updateCourseAction,
  togglePublishAction,
  createChapterAction,
  deleteChapterAction,
  createLessonAction,
  deleteLessonAction,
  manualEnrollAction,
} from "@/lib/actions/admin";
import CourseForm from "@/components/CourseForm";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enroll_error?: string; enrolled?: string }>;
}) {
  const { id } = await params;
  const { enroll_error, enrolled } = await searchParams;
  const course = await getCourseById(Number(id));
  if (!course) notFound();

  const chapters = await getCourseChapters(course.id);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">編輯課程</h1>
          <form action={togglePublishAction}>
            <input type="hidden" name="courseId" value={course.id} />
            <button
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                course.is_published
                  ? "border border-slate-300 text-slate-600 hover:bg-slate-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {course.is_published ? "下架課程" : "上架課程"}
            </button>
          </form>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <CourseForm
            action={updateCourseAction}
            course={{ ...course }}
            courseId={course.id}
            submitLabel="儲存變更"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">章節與單元</h2>
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="rounded-lg border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="font-semibold">{chapter.title}</p>
                <form action={deleteChapterAction}>
                  <input type="hidden" name="chapterId" value={chapter.id} />
                  <input type="hidden" name="courseId" value={course.id} />
                  <button className="text-xs text-red-600 hover:underline">
                    刪除章節
                  </button>
                </form>
              </div>
              <ul className="divide-y divide-slate-100">
                {chapter.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span>
                      {lesson.title}
                      <span className="ml-2 text-xs text-slate-400">
                        {lesson.duration_minutes} 分鐘
                      </span>
                    </span>
                    <form action={deleteLessonAction}>
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="courseId" value={course.id} />
                      <button className="text-xs text-red-600 hover:underline">
                        刪除
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <form
                action={createLessonAction}
                className="flex flex-wrap items-end gap-2 border-t border-slate-100 px-4 py-3"
              >
                <input type="hidden" name="chapterId" value={chapter.id} />
                <input type="hidden" name="courseId" value={course.id} />
                <div className="flex-1 min-w-[140px]">
                  <label className="mb-1 block text-xs text-slate-500">
                    單元名稱
                  </label>
                  <input
                    name="title"
                    required
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-xs text-slate-500">
                    影片網址（支援 YouTube 連結，建議設為「不公開」）
                  </label>
                  <input
                    name="video_url"
                    placeholder="貼上 YouTube 連結或影片檔案網址"
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs text-slate-500">
                    分鐘
                  </label>
                  <input
                    name="duration_minutes"
                    type="number"
                    min={0}
                    defaultValue={10}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-900"
                >
                  新增單元
                </button>
              </form>
            </div>
          ))}

          <form
            action={createChapterAction}
            className="flex items-end gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-4"
          >
            <input type="hidden" name="courseId" value={course.id} />
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">
                新增章節名稱
              </label>
              <input
                name="title"
                required
                placeholder="例如：第三章：進階應用"
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              新增章節
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">手動開通學生</h2>
        <p className="mb-3 text-sm text-slate-500">
          如果你是私下（例如自己傳付款連結、匯款、LINE Pay
          等）跟學生收款，不透過網站結帳，可以在這裡直接用學生的
          email 開通這堂課的觀看權限。學生要先自己在網站上「免費註冊」過帳號，這裡才找得到人。
        </p>
        {enroll_error && (
          <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {enroll_error}
          </div>
        )}
        {enrolled && (
          <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            已成功開通，這位學生現在可以登入觀看課程了。
          </div>
        )}
        <form
          action={manualEnrollAction}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-4"
        >
          <input type="hidden" name="courseId" value={course.id} />
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1 block text-xs text-slate-500">
              學生的 email（要先請學生在網站註冊過）
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="student@example.com"
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            開通課程
          </button>
        </form>
      </div>
    </div>
  );
}
