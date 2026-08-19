"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { one } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1, "請輸入姓名"),
  email: z.string().email("請輸入正確的 Email"),
  password: z.string().min(6, "密碼至少需要 6 個字元"),
});

export type FormState = { error?: string } | null;

export async function registerAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const { name, email, password } = parsed.data;

  const existing = await one<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  if (existing) {
    return { error: "這個 Email 已經被註冊過了" };
  }

  const info = await one<{ id: number }>(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'student') RETURNING id",
    [email.toLowerCase(), hashPassword(password), name]
  );

  await createSession(info!.id);
  redirect("/account");
}

const loginSchema = z.object({
  email: z.string().email("請輸入正確的 Email"),
  password: z.string().min(1, "請輸入密碼"),
});

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const { email, password } = parsed.data;

  const user = await one<{ id: number; password_hash: string; role: string }>(
    "SELECT id, password_hash, role FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Email 或密碼不正確" };
  }

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
