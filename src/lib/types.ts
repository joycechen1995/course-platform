export type Course = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover_image: string;
  price: number;
  instructor_name: string;
  instructor_bio: string;
  is_published: number;
  created_at: string;
};

export type Chapter = {
  id: number;
  course_id: number;
  title: string;
  position: number;
};

export type Lesson = {
  id: number;
  chapter_id: number;
  title: string;
  video_url: string;
  duration_minutes: number;
  position: number;
  is_preview: number;
};

export type Order = {
  id: number;
  user_id: number;
  course_id: number;
  amount: number;
  coupon_code: string | null;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
};

export type Enrollment = {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
};

export type Coupon = {
  id: number;
  code: string;
  discount_percent: number;
  course_id: number | null;
  is_active: number;
  created_at: string;
};

export type ChapterWithLessons = Chapter & { lessons: Lesson[] };
