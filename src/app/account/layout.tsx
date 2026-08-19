import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">會員中心</h1>
      <p className="mb-6 text-sm text-slate-500">{user.name}（{user.email}）</p>
      <div className="mb-8 flex gap-4 border-b border-slate-200 text-sm">
        <Link
          href="/account"
          className="border-b-2 border-transparent px-1 pb-3 hover:border-indigo-600 hover:text-indigo-600"
        >
          我的課程
        </Link>
        <Link
          href="/account/orders"
          className="border-b-2 border-transparent px-1 pb-3 hover:border-indigo-600 hover:text-indigo-600"
        >
          訂單紀錄
        </Link>
      </div>
      {children}
    </div>
  );
}
