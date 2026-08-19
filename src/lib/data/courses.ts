import "server-only";
import { one, many } from "@/lib/db";
import type {
  Course,
  Chapter,
  Lesson,
  ChapterWithLessons,
  Order,
  Coupon,
} from "@/lib/types";

export async function listPublishedCourses(): Promise<Course[]> {
  return many<Course>(
    "SELECT * FROM courses WHERE is_published = 1 ORDER BY created_at DESC"
  );
}

export async function listAllCourses(): Promise<Course[]> {
  return many<Course>("SELECT * FROM courses ORDER BY created_at DESC");
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return (
    (await one<Course>("SELECT * FROM courses WHERE slug = $1", [slug])) ?? null
  );
}

export async function getCourseById(id: number): Promise<Course | null> {
  return (await one<Course>("SELECT * FROM courses WHERE id = $1", [id])) ?? null;
}

export async function getCourseChapters(courseId: number): Promise<ChapterWithLessons[]> {
  const chapters = await many<Chapter>(
    "SELECT * FROM chapters WHERE course_id = $1 ORDER BY position ASC, id ASC",
    [courseId]
  );

  return Promise.all(
    chapters.map(async (chapter) => ({
      ...chapter,
      lessons: await many<Lesson>(
        "SELECT * FROM lessons WHERE chapter_id = $1 ORDER BY position ASC, id ASC",
        [chapter.id]
      ),
    }))
  );
}

export async function getLessonById(lessonId: number): Promise<Lesson | null> {
  return (
    (await one<Lesson>("SELECT * FROM lessons WHERE id = $1", [lessonId])) ?? null
  );
}

export async function getChapterById(chapterId: number): Promise<Chapter | null> {
  return (
    (await one<Chapter>("SELECT * FROM chapters WHERE id = $1", [chapterId])) ?? null
  );
}

export async function isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
  const row = await one<{ id: number }>(
    "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
    [userId, courseId]
  );
  return !!row;
}

export async function getUserEnrolledCourses(userId: number): Promise<Course[]> {
  return many<Course>(
    `SELECT c.* FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     WHERE e.user_id = $1
     ORDER BY e.enrolled_at DESC`,
    [userId]
  );
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  return many<Order>(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  return (
    (await one<Order>("SELECT * FROM orders WHERE id = $1", [orderId])) ?? null
  );
}

export async function findActiveCoupon(code: string, courseId: number): Promise<Coupon | null> {
  return (
    (await one<Coupon>(
      `SELECT * FROM coupons
       WHERE code = $1 AND is_active = 1
       AND (course_id IS NULL OR course_id = $2)`,
      [code.trim().toUpperCase(), courseId]
    )) ?? null
  );
}

export async function getLessonProgressSet(
  userId: number,
  lessonIds: number[]
): Promise<Set<number>> {
  if (lessonIds.length === 0) return new Set();
  const placeholders = lessonIds.map((_, i) => `$${i + 2}`).join(",");
  const rows = await many<{ lesson_id: number }>(
    `SELECT lesson_id FROM lesson_progress WHERE user_id = $1 AND lesson_id IN (${placeholders})`,
    [userId, ...lessonIds]
  );
  return new Set(rows.map((r) => r.lesson_id));
}

// --- Admin ---
export async function adminListOrders() {
  return many<
    Order & { user_name: string; user_email: string; course_title: string }
  >(
    `SELECT o.*, u.name as user_name, u.email as user_email, c.title as course_title
     FROM orders o
     JOIN users u ON u.id = o.user_id
     JOIN courses c ON c.id = o.course_id
     ORDER BY o.created_at DESC`
  );
}

export async function adminListStudents() {
  return many<{
    id: number;
    name: string;
    email: string;
    created_at: string;
    courses_count: number;
    total_spent: number;
  }>(
    `SELECT u.id, u.name, u.email, u.created_at,
            COUNT(DISTINCT e.course_id) as courses_count,
            COALESCE(SUM(CASE WHEN o.status='paid' THEN o.amount ELSE 0 END), 0) as total_spent
     FROM users u
     LEFT JOIN enrollments e ON e.user_id = u.id
     LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
     WHERE u.role = 'student'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
}

export async function adminSalesSummary() {
  const revenue = (await one<{ total: number }>(
    "SELECT COALESCE(SUM(amount),0) as total FROM orders WHERE status='paid'"
  ))!;
  const paidOrders = (await one<{ c: number }>(
    "SELECT COUNT(*) as c FROM orders WHERE status='paid'"
  ))!;
  const totalOrders = (await one<{ c: number }>("SELECT COUNT(*) as c FROM orders"))!;
  const students = (await one<{ c: number }>(
    "SELECT COUNT(*) as c FROM users WHERE role='student'"
  ))!;
  const totalOrdersCount = Number(totalOrders.c);
  const paidOrdersCount = Number(paidOrders.c);
  const conversion =
    totalOrdersCount > 0 ? Math.round((paidOrdersCount / totalOrdersCount) * 100) : 0;
  return {
    totalRevenue: Number(revenue.total),
    paidOrders: paidOrdersCount,
    totalOrders: totalOrdersCount,
    totalStudents: Number(students.c),
    conversionRate: conversion,
  };
}

export async function listCoupons(): Promise<Coupon[]> {
  return many<Coupon>("SELECT * FROM coupons ORDER BY created_at DESC");
}
