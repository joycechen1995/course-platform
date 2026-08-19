import { adminSalesSummary } from "@/lib/data/courses";

export default async function AdminDashboardPage() {
  const summary = await adminSalesSummary();

  const stats = [
    { label: "總營收", value: `NT$ ${summary.totalRevenue.toLocaleString()}` },
    { label: "已付款訂單", value: summary.paidOrders },
    { label: "學生總數", value: summary.totalStudents },
    { label: "訂單轉換率", value: `${summary.conversionRate}%` },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">總覽</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
