import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseById, getOrderById } from "@/lib/data/courses";
import { payOrderAction } from "@/lib/actions/checkout";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const order = await getOrderById(Number(orderId));
  if (!order || order.user_id !== user.id) notFound();

  const course = await getCourseById(order.course_id);
  if (!course) notFound();

  if (order.status === "paid") {
    redirect(`/checkout/${order.id}/success?slug=${course.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">確認付款</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="font-semibold">{course.title}</p>
            <p className="text-sm text-slate-500">
              訂單編號 #{order.id}
              {order.coupon_code ? `　已套用優惠碼 ${order.coupon_code}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-slate-600">應付金額</span>
          <span className="text-xl font-bold text-indigo-600">
            NT$ {order.amount.toLocaleString()}
          </span>
        </div>

        <div className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          這是模擬付款畫面。實際上線時，這裡會換成綠界／藍新等金流的信用卡、超商代碼或
          ATM 轉帳付款頁面，並在收到金流的付款成功通知後才開通課程權限。
        </div>

        <form action={payOrderAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            模擬完成付款
          </button>
        </form>
        <Link
          href={`/courses/${course.slug}`}
          className="mt-3 block text-center text-sm text-slate-500 hover:underline"
        >
          返回課程頁
        </Link>
      </div>
    </div>
  );
}
