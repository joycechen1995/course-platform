import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export default function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-bold text-white shadow-sm">
            禾
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            心禾學苑
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/courses"
            className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
          >
            所有課程
          </Link>
          {!user && (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="ml-1 rounded-full bg-indigo-600 px-4 py-2 text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-md"
              >
                免費註冊
              </Link>
            </>
          )}
          {user && user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
            >
              後台管理
            </Link>
          )}
          {user && (
            <>
              <Link
                href="/account"
                className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
              >
                我的課程
              </Link>
              <form action={logoutAction}>
                <button className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600">
                  登出（{user.name}）
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
