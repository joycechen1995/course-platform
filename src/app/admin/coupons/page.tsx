import { listAllCourses, listCoupons } from "@/lib/data/courses";
import { toggleCouponAction } from "@/lib/actions/admin";
import CouponForm from "@/components/CouponForm";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  const courses = await listAllCourses();
  const courseMap = new Map(courses.map((c) => [c.id, c.title]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">優惠券管理</h1>
      <div className="mb-6">
        <CouponForm courses={courses.map((c) => ({ ...c }))} />
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">代碼</th>
              <th className="px-4 py-3">折扣</th>
              <th className="px-4 py-3">適用課程</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  還沒有優惠券
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-4 py-3 font-mono">{coupon.code}</td>
                <td className="px-4 py-3">{coupon.discount_percent}%</td>
                <td className="px-4 py-3">
                  {coupon.course_id ? courseMap.get(coupon.course_id) ?? "—" : "全部課程"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      coupon.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {coupon.is_active ? "啟用中" : "已停用"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleCouponAction}>
                    <input type="hidden" name="couponId" value={coupon.id} />
                    <button className="text-indigo-600 hover:underline">
                      {coupon.is_active ? "停用" : "啟用"}
                    </button>
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
