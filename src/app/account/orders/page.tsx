import { getCurrentUser } from "@/lib/auth";
import { getUserOrders, getCourseById } from "@/lib/data/courses";

const statusLabel: Record<string, string> = {
  paid: "已付款",
  pending: "待付款",
  cancelled: "已取消",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = user ? await getUserOrders(user.id) : [];
  const courses = await Promise.all(orders.map((order) => getCourseById(order.course_id)));
  const courseByOrderId = new Map(orders.map((order, i) => [order.id, courses[i]]));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3">訂單編號</th>
            <th className="px-4 py-3">課程</th>
            <th className="px-4 py-3">金額</th>
            <th className="px-4 py-3">狀態</th>
            <th className="px-4 py-3">建立時間</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                還沒有任何訂單
              </td>
            </tr>
          )}
          {orders.map((order) => {
            const course = courseByOrderId.get(order.id);
            return (
              <tr key={order.id}>
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">{course?.title ?? "—"}</td>
                <td className="px-4 py-3">NT$ {order.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      order.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {order.created_at}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
