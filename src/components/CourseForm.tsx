"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions/admin";
import SubmitButton from "./SubmitButton";
import type { Course } from "@/lib/types";

const initialState: FormState = null;

export default function CourseForm({
  action,
  course,
  courseId,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  course?: Course;
  courseId?: number;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {courseId && <input type="hidden" name="courseId" value={courseId} />}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          課程名稱
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={course?.title}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          副標題
        </label>
        <input
          type="text"
          name="subtitle"
          defaultValue={course?.subtitle}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          課程介紹
        </label>
        <textarea
          name="description"
          rows={4}
          defaultValue={course?.description}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          封面圖片網址
        </label>
        <input
          type="text"
          name="cover_image"
          defaultValue={course?.cover_image}
          placeholder="https://..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          價格（新台幣）
        </label>
        <input
          type="number"
          name="price"
          min={0}
          required
          defaultValue={course?.price ?? 0}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          講師名稱
        </label>
        <input
          type="text"
          name="instructor_name"
          defaultValue={course?.instructor_name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          講師介紹
        </label>
        <textarea
          name="instructor_bio"
          rows={3}
          defaultValue={course?.instructor_bio}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" aria-live="polite">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="儲存中…">{submitLabel}</SubmitButton>
    </form>
  );
}
