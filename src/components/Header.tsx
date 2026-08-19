import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export default function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          我的線上課程平台
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/courses" className="text-slate-600 hover:text-indigo-600">
            所有課程
          </Link>
          {!user && (
            <>
              <Link href="/login" className="text-slate-600 hover:text-indigo-600">
                登入
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                免費註冊
              </Link>
            </>
          )}
          {user && user.role === "admin" && (
            <Link href="/admin" className="text-slate-600 hover:text-indigo-600">
              後台管理
            </Link>
          )}
          {user && (
            <>
              <Link href="/account" className="text-slate-600 hover:text-indigo-600">
                我的課程
              </Link>
              <form action={logoutAction}>
                <button className="text-slate-600 hover:text-indigo-600">
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
