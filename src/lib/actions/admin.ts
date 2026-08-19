"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { one, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCourseById } from "@/lib/data/courses";

export type FormState = { error?: string } | null;

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  return user;
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Date.now().toString(36).slice(-5);
  return `${base || "course"}-${suffix}`;
}

const courseSchema = z.object({
  title: z.string().min(1, "請輸入課程名稱"),
  subtitle: z.string().optional().default(""),
  description: z.string().optional().default(""),
  cover_image: z.string().optional().default(""),
  price: z.coerce.number().int().min(0, "價格不可為負數"),
  instructor_name: z.string().optional().default(""),
  instructor_bio: z.string().optional().default(""),
});

export async function createCourseAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    cover_image: formData.get("cover_image"),
    price: formData.get("price"),
    instructor_name: formData.get("instructor_name"),
    instructor_bio: formData.get("instructor_bio"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const data = parsed.data;
  const slug = slugify(data.title);

  const info = await one<{ id: number }>(
    `INSERT INTO courses
      (slug, title, subtitle, description, cover_image, price, instructor_name, instructor_bio, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
     RETURNING id`,
    [
      slug,
      data.title,
      data.subtitle,
      data.description,
      data.cover_image,
      data.price,
      data.instructor_name,
      data.instructor_bio,
    ]
  );

  redirect(`/admin/courses/${info!.id}`);
}

export async function updateCourseAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const courseId = Number(formData.get("courseId"));
  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    cover_image: formData.get("cover_image"),
    price: formData.get("price"),
    instructor_name: formData.get("instructor_name"),
    instructor_bio: formData.get("instructor_bio"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const data = parsed.data;

  await run(
    `UPDATE courses SET title=$1, subtitle=$2, description=$3, cover_image=$4, price=$5, instructor_name=$6, instructor_bio=$7
     WHERE id = $8`,
    [
      data.title,
      data.subtitle,
      data.description,
      data.cover_image,
      data.price,
      data.instructor_name,
      data.instructor_bio,
      courseId,
    ]
  );

  revalidatePath(`/admin/courses/${courseId}`);
  return { error: undefined };
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();
  const courseId = Number(formData.get("courseId"));
  const course = await getCourseById(courseId);
  if (!course) return;
  await run("UPDATE courses SET is_published = $1 WHERE id = $2", [
    course.is_published ? 0 : 1,
    courseId,
  ]);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
}

export async function createChapterAction(formData: FormData) {
  await requireAdmin();
  const courseId = Number(formData.get("courseId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/courses/${courseId}`);

  const maxPos = await one<{ m: number }>(
    "SELECT COALESCE(MAX(position), -1) as m FROM chapters WHERE course_id = $1",
    [courseId]
  );

  await run("INSERT INTO chapters (course_id, title, position) VALUES ($1, $2, $3)", [
    courseId,
    title,
    Number(maxPos!.m) + 1,
  ]);

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteChapterAction(formData: FormData) {
  await requireAdmin();
  const chapterId = Number(formData.get("chapterId"));
  const courseId = Number(formData.get("courseId"));
  await run("DELETE FROM chapters WHERE id = $1", [chapterId]);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLessonAction(formData: FormData) {
  await requireAdmin();
  const chapterId = Number(formData.get("chapterId"));
  const courseId = Number(formData.get("courseId"));
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const duration = Number(formData.get("duration_minutes") ?? 0);
  if (!title) redirect(`/admin/courses/${courseId}`);

  const maxPos = await one<{ m: number }>(
    "SELECT COALESCE(MAX(position), -1) as m FROM lessons WHERE chapter_id = $1",
    [chapterId]
  );

  await run(
    `INSERT INTO lessons (chapter_id, title, video_url, duration_minutes, position, is_preview)
     VALUES ($1, $2, $3, $4, $5, 0)`,
    [chapterId, title, videoUrl, duration, Number(maxPos!.m) + 1]
  );

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdmin();
  const lessonId = Number(formData.get("lessonId"));
  const courseId = Number(formData.get("courseId"));
  await run("DELETE FROM lessons WHERE id = $1", [lessonId]);
  revalidatePath(`/admin/courses/${courseId}`);
}

const couponSchema = z.object({
  code: z.string().min(3, "代碼至少 3 個字元"),
  discount_percent: z.coerce.number().int().min(1).max(100),
});

export async function createCouponAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discount_percent: formData.get("discount_percent"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const courseIdRaw = formData.get("course_id");
  const courseId =
    courseIdRaw && String(courseIdRaw).length > 0
      ? Number(courseIdRaw)
      : null;

  try {
    await run(
      "INSERT INTO coupons (code, discount_percent, course_id, is_active) VALUES ($1, $2, $3, 1)",
      [parsed.data.code.trim().toUpperCase(), parsed.data.discount_percent, courseId]
    );
  } catch {
    return { error: "這個優惠碼已經存在" };
  }

  revalidatePath("/admin/coupons");
  return { error: undefined };
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const couponId = Number(formData.get("couponId"));
  const coupon = await one<{ is_active: number }>(
    "SELECT is_active FROM coupons WHERE id = $1",
    [couponId]
  );
  if (!coupon) return;
  await run("UPDATE coupons SET is_active = $1 WHERE id = $2", [
    coupon.is_active ? 0 : 1,
    couponId,
  ]);
  revalidatePath("/admin/coupons");
}
