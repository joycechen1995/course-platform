import "server-only";
import { Pool, types } from "pg";
import bcrypt from "bcryptjs";

/**
 * By default `pg` parses TIMESTAMP/TIMESTAMPTZ columns into native JS Date
 * objects. The old node:sqlite version stored/returned these as plain TEXT,
 * every `created_at`/`enrolled_at`/`completed_at` field is typed as
 * `string` in src/lib/types.ts, and several Server Components render them
 * directly as JSX children (e.g. `{order.created_at}`) — which throws for
 * a Date object. Registering these type parsers keeps the values as the
 * raw string Postgres sends back, so existing call sites keep working
 * unchanged.
 */
types.setTypeParser(types.builtins.TIMESTAMP, (val) => val);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val);

/**
 * Postgres (via `pg`) already returns plain objects, so unlike the old
 * node:sqlite version these helpers don't need to strip a null prototype.
 * They're kept around (as thin async wrappers over pool.query) purely to
 * minimize churn at call sites across the codebase.
 */
type QueryParams = unknown[];

const globalForDb = globalThis as unknown as { __coursePool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 環境變數未設定。請設定為指向 PostgreSQL 資料庫的連線字串，" +
        "例如 postgres://user:pass@host:5432/dbname（本機開發可參考 README 說明）。"
    );
  }
  // Render 的外部連線需要 SSL，內部連線與本機開發則不需要。
  const needsSsl =
    process.env.NODE_ENV === "production" || connectionString.includes("render.com");
  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });
}

// --- Singleton pool (survives Next.js dev hot-reload) ---
// Created lazily so importing this module never throws at build time
// (e.g. during `next build`'s module graph / static analysis) when
// DATABASE_URL isn't set. The pool (and any real connection attempt)
// only happens once a query actually runs, i.e. at request time.
function getPool(): Pool {
  if (!globalForDb.__coursePool) {
    globalForDb.__coursePool = createPool();
  }
  return globalForDb.__coursePool;
}

export async function one<T>(text: string, params: QueryParams = []): Promise<T | undefined> {
  const res = await getPool().query(text, params);
  return res.rows[0] as T | undefined;
}

export async function many<T>(text: string, params: QueryParams = []): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

export async function run(
  text: string,
  params: QueryParams = []
): Promise<{ rowCount: number; rows: any[] }> {
  const res = await getPool().query(text, params);
  return { rowCount: res.rowCount ?? 0, rows: res.rows };
}

// --- Schema ---
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' | 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  instructor_name TEXT NOT NULL DEFAULT '',
  instructor_bio TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  is_preview INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Migration for databases created before the "1 year access" feature:
-- adds the column if it's missing, and backfills any pre-existing
-- enrollment (which had no expiry) to expire 1 year after it was granted.
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
UPDATE enrollments SET expires_at = enrolled_at + INTERVAL '1 year' WHERE expires_at IS NULL;

CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE, -- NULL = 適用所有課程
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function ensureSchema() {
  await getPool().query(SCHEMA_SQL);
}

// --- Seed data (only runs once, when courses table is empty) ---
async function seed() {
  const courseCount = await one<{ c: string }>("SELECT COUNT(*) as c FROM courses");
  if (courseCount && Number(courseCount.c) > 0) return;

  const adminPasswordHash = bcrypt.hashSync("teach1234", 10);
  const studentPasswordHash = bcrypt.hashSync("student1234", 10);

  await run(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')",
    ["instructor@example.com", adminPasswordHash, "課程講師"]
  );

  await run(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'student')",
    ["student@example.com", studentPasswordHash, "示範學生"]
  );

  const insertCourse = async (
    slug: string,
    title: string,
    subtitle: string,
    description: string,
    coverImage: string,
    price: number,
    instructorName: string,
    instructorBio: string
  ) => {
    const row = await one<{ id: number }>(
      `INSERT INTO courses
        (slug, title, subtitle, description, cover_image, price, instructor_name, instructor_bio, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
       RETURNING id`,
      [slug, title, subtitle, description, coverImage, price, instructorName, instructorBio]
    );
    return row!.id;
  };

  const course1Id = await insertCourse(
    "nextjs-fullstack-course",
    "Next.js 全端開發實戰",
    "從零開始打造一個可以上線的全端網站",
    "這門課程會帶你從專案初始化開始，一步步完成前台頁面、會員系統、金流串接與後台管理，適合有基礎 JavaScript 但還沒做過完整全端專案的學員。",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    2400,
    "課程講師",
    "全端工程師，曾任職於多家新創公司，專注於教育科技產品開發。"
  );

  const course2Id = await insertCourse(
    "video-editing-for-creators",
    "自媒體剪輯入門到接案",
    "用手機也能剪出質感影片",
    "適合完全沒有剪輯經驗的自媒體經營者，從基本剪輯邏輯、轉場、字幕，到如何建立自己的接案作品集。",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
    1800,
    "課程講師",
    "自媒體經營者與影像剪輯師，累積超過百支商業影片製作經驗。"
  );

  const courseIds = [course1Id, course2Id];

  const insertChapter = async (courseId: number, title: string, position: number) => {
    const row = await one<{ id: number }>(
      "INSERT INTO chapters (course_id, title, position) VALUES ($1, $2, $3) RETURNING id",
      [courseId, title, position]
    );
    return row!.id;
  };

  const insertLesson = (
    chapterId: number,
    title: string,
    videoUrl: string,
    durationMinutes: number,
    position: number,
    isPreview: number
  ) =>
    run(
      `INSERT INTO lessons (chapter_id, title, video_url, duration_minutes, position, is_preview)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [chapterId, title, videoUrl, durationMinutes, position, isPreview]
    );

  // 示範影片使用公開的免費範例影片，實際上線時請換成自己的影音託管連結（見規劃文件第六節）
  const sampleVideo =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  const chapterPlan: Record<number, { title: string; lessons: string[] }[]> = {
    0: [
      {
        title: "第一章：專案起步",
        lessons: ["課程介紹與環境安裝", "建立第一個頁面"],
      },
      {
        title: "第二章：會員與金流",
        lessons: ["會員註冊登入", "串接結帳流程", "開通課程權限"],
      },
    ],
    1: [
      {
        title: "第一章：剪輯基礎",
        lessons: ["認識剪輯軟體介面", "剪接點與節奏感"],
      },
      {
        title: "第二章：進階技巧",
        lessons: ["轉場與字幕", "如何接到第一個案子"],
      },
    ],
  };

  for (let courseIdx = 0; courseIdx < courseIds.length; courseIdx++) {
    const courseId = courseIds[courseIdx];
    const chapters = chapterPlan[courseIdx];
    for (let chapterIdx = 0; chapterIdx < chapters.length; chapterIdx++) {
      const chapter = chapters[chapterIdx];
      const chapterId = await insertChapter(courseId, chapter.title, chapterIdx);
      for (let lessonIdx = 0; lessonIdx < chapter.lessons.length; lessonIdx++) {
        await insertLesson(
          chapterId,
          chapter.lessons[lessonIdx],
          sampleVideo,
          8 + lessonIdx * 3,
          lessonIdx,
          chapterIdx === 0 && lessonIdx === 0 ? 1 : 0
        );
      }
    }
  }

  await run(
    "INSERT INTO coupons (code, discount_percent, course_id, is_active) VALUES ($1, $2, NULL, 1)",
    ["WELCOME10", 10]
  );
}

// `ensureSeeded` is exported so request-time code (e.g. middleware or the
// root layout) could `await` it if strict ordering is ever needed. At this
// MVP's scale a small cold-start race (a request arriving before the first
// seed finishes) is an accepted, documented limitation.
export const ensureSeeded: Promise<void> = (async () => {
  if (!process.env.DATABASE_URL) {
    // Don't attempt to connect at module-import time (e.g. during
    // `next build`) when there's no database configured yet.
    return;
  }
  try {
    await ensureSchema();
    await seed();
  } catch (err) {
    console.error("[db] 初始化資料庫結構 / 種子資料失敗：", err);
  }
})();
