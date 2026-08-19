"use client";

import { useActionState } from "react";
import { createOrderAction, type FormState } from "@/lib/actions/checkout";
import SubmitButton from "./SubmitButton";

const initialState: FormState = null;

export default function PurchaseForm({ courseId }: { courseId: number }) {
  const [state, formAction] = useActionState(createOrderAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="courseId" value={courseId} />
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          優惠碼（選填，可試試 WELCOME10）
        </label>
        <input
          type="text"
          name="couponCode"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none"
          placeholder="WELCOME10"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" aria-live="polite">
          {state.error}
        </p>
      )}
      <SubmitButton className="w-full" pendingText="建立訂單中…">
        立即購買
      </SubmitButton>
    </form>
  );
}
