"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { run } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getChapterById, getLessonById, isUserEnrolled } from "@/lib/data/courses";
import { getCourseById } from "@/lib/data/courses";

export async function toggleLessonCompleteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lessonId = Number(formData.get("lessonId"));
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const shouldComplete = formData.get("complete") === "1";

  const lesson = await getLessonById(lessonId);
  if (!lesson) redirect(`/learn/${courseSlug}`);

  const chapter = await getChapterById(lesson!.chapter_id);
  if (!chapter) redirect(`/learn/${courseSlug}`);

  const course = await getCourseById(chapter!.course_id);
  if (!course || !(await isUserEnrolled(user.id, course.id))) {
    redirect("/account");
  }

  if (shouldComplete) {
    await run(
      "INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [user.id, lessonId]
    );
  } else {
    await run(
      "DELETE FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2",
      [user.id, lessonId]
    );
  }

  revalidatePath(`/learn/${courseSlug}`);
}
