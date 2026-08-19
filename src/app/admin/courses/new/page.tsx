import CourseForm from "@/components/CourseForm";
import { createCourseAction } from "@/lib/actions/admin";

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">新增課程</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <CourseForm action={createCourseAction} submitLabel="建立課程" />
      </div>
    </div>
  );
}
