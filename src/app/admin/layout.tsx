import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/courses", label: "課程管理" },
  { href: "/admin/orders", label: "訂單管理" },
  { href: "/admin/students", label: "學生名單" },
  { href: "/admin/coupons", label: "優惠券" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login?next=/admin");

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-48 shrink-0">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          講師後台
        </p>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
