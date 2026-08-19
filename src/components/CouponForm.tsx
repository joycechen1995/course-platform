"use client";

import { useActionState } from "react";
import { createCouponAction, type FormState } from "@/lib/actions/admin";
import SubmitButton from "./SubmitButton";
import type { Course } from "@/lib/types";

const initialState: FormState = null;

export default function CouponForm({ courses }: { courses: Course[] }) {
  const [state, formAction] = useActionState(createCouponAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div>
        <label className="mb-1 block text-xs text-slate-500">優惠碼</label>
        <input
          name="code"
          required
          placeholder="SUMMER20"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm uppercase"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">折扣（%）</label>
        <input
          name="discount_percent"
          type="number"
          min={1}
          max={100}
          required
          defaultValue={10}
          className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">適用課程</label>
        <select
          name="course_id"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          defaultValue=""
        >
          <option value="">全部課程</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton pendingText="建立中…">建立優惠券</SubmitButton>
    </form>
  );
}
