"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button for plain server-action <form>s (the ones that don't use
 * useActionState) that:
 *  - shows a "處理中…" pending state via useFormStatus, so admins get
 *    immediate visual feedback instead of a form that looks unresponsive
 *    while the server action runs (this matters on Render's free tier,
 *    where a cold/sleeping instance can take many seconds to respond).
 *  - optionally asks for confirmation before submitting, for destructive
 *    actions like deleting a chapter, lesson, or order.
 */
export default function FormButton({
  children,
  className = "",
  pendingText = "處理中…",
  confirmText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  confirmText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
