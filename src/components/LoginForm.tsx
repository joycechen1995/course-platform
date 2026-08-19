"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/lib/actions/auth";
import SubmitButton from "./SubmitButton";

const initialState: FormState = null;

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          密碼
        </label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" aria-live="polite">
          {state.error}
        </p>
      )}
      <SubmitButton className="w-full" pendingText="登入中…">
        登入
      </SubmitButton>
    </form>
  );
}
