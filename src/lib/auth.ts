import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { one } from "./db";

const SESSION_COOKIE = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 天
const SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "student" | "admin";
};

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function createSessionToken(userId: number): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${userId}.${exp}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function parseSessionToken(token: string): { userId: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userIdStr, expStr, signature] = decoded.split(".");
    const payload = `${userIdStr}.${expStr}`;
    if (sign(payload) !== signature) return null;
    const exp = parseInt(expStr, 10);
    if (Number.isNaN(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    const userId = parseInt(userIdStr, 10);
    if (Number.isNaN(userId)) return null;
    return { userId };
  } catch {
    return null;
  }
}

/** 在 server action / route handler 中呼叫，設定登入 cookie */
export async function createSession(userId: number) {
  const token = createSessionToken(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** 取得目前登入者，未登入回傳 null */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const parsed = parseSessionToken(token);
  if (!parsed) return null;
  const row = await one<SessionUser>(
    "SELECT id, email, name, role FROM users WHERE id = $1",
    [parsed.userId]
  );
  return row ?? null;
}
