"use server";

import { redirect } from "next/navigation";
import { one, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  findActiveCoupon,
  getCourseById,
  getOrderById,
  isUserEnrolled,
} from "@/lib/data/courses";

export type FormState = { error?: string } | null;

export async function createOrderAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/courses");
  }

  const courseId = Number(formData.get("courseId"));
  const couponCode = String(formData.get("couponCode") ?? "").trim();

  const course = await getCourseById(courseId);
  if (!course) {
    return { error: "找不到這個課程" };
  }

  if (await isUserEnrolled(user.id, courseId)) {
    redirect(`/learn/${course.slug}`);
  }

  let amount = course.price;
  let appliedCode: string | null = null;

  if (couponCode) {
    const coupon = await findActiveCoupon(couponCode, courseId);
    if (!coupon) {
      return { error: "優惠券代碼無效或已過期" };
    }
    amount = Math.round(course.price * (1 - coupon.discount_percent / 100));
    appliedCode = coupon.code;
  }

  const info = await one<{ id: number }>(
    "INSERT INTO orders (user_id, course_id, amount, coupon_code, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id",
    [user.id, courseId, amount, appliedCode]
  );

  redirect(`/checkout/${info!.id}`);
}

/**
 * 模擬付款完成。實際上線時，這裡會換成綠界/藍新等金流的
 * server-to-server 付款結果通知 (Notify) 驗證後才觸發開通課程權限。
 */
export async function payOrderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orderId = Number(formData.get("orderId"));
  const order = await getOrderById(orderId);
  if (!order || order.user_id !== user.id) {
    redirect("/account/orders");
  }

  if (order.status === "pending") {
    await run("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
    await run(
      "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [user.id, order.course_id]
    );
  }

  const course = await getCourseById(order.course_id);
  redirect(`/checkout/${orderId}/success${course ? `?slug=${course.slug}` : ""}`);
}
