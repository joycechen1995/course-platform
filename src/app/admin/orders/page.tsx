import { adminListOrders } from "@/lib/data/courses";
import { deleteOrderAction } from "@/lib/actions/admin";
import FormButton from "@/components/FormButton";

const statusLabel: Record<string, string> = {
  paid: "已付款",
  pending: "待付款",
  cancelled: "已取消",
};

export default async function AdminOrdersPage() {
  const orders = await adminListOrders();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">訂單管理</h1>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">訂單編號</th>
              <th className="px-4 py-3">學生</th>
              <th className="px-4 py-3">課程</th>
              <th className="px-4 py-3">金額</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">時間</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  還沒有任何訂單
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">
                  {order.user_name}
                  <div className="text-xs text-slate-400">{order.user_email}</div>
                </td>
                <td className="px-4 py-3">{order.course_title}</td>
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
                <td className="px-4 py-3 text-slate-500">{order.created_at}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteOrderAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <FormButton
                      className="text-xs text-rose-600 hover:underline"
                      confirmText={`確定要刪除訂單 #${order.id} 嗎？此動作無法復原（不會影響學生已經開通的課程權限）。`}
                    >
                      刪除
                    </FormButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
