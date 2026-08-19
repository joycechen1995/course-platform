import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold">登入</h1>
      <p className="mb-6 text-sm text-slate-500">
        講師測試帳號：instructor@example.com / teach1234　　學生測試帳號：
        student@example.com / student1234
      </p>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        還沒有帳號？{" "}
        <Link href="/register" className="text-indigo-600 hover:underline">
          立即註冊
        </Link>
      </p>
    </div>
  );
}
