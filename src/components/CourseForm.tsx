"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions/admin";
import SubmitButton from "./SubmitButton";
import ImageUploadField from "./ImageUploadField";
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
      <ImageUploadField
        name="cover_image"
        label="課程封面圖片"
        defaultValue={course?.cover_image}
        maxDimension={1400}
        helperText="建議使用橫向圖片，會顯示在課程列表與課程介紹頁最上方"
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          這堂課能學到什麼（每行一項，會顯示在課程介紹頁）
        </label>
        <textarea
          name="highlights"
          rows={4}
          defaultValue={course?.highlights}
          placeholder={"例如：\n從零開始學會剪輯基本技巧\n掌握轉場與字幕製作\n建立自己的作品集"}
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
      <ImageUploadField
        name="instructor_photo"
        label="講師照片"
        defaultValue={course?.instructor_photo}
        maxDimension={500}
        shape="circle"
        helperText="建議使用正方形大頭照，會顯示在課程介紹頁的講師介紹區塊"
      />
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
