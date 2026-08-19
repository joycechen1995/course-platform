import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "我的線上課程平台",
  description: "個人講師線上課程平台 MVP",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} 我的線上課程平台 · 這是一個開發示範用的
          MVP 系統
        </footer>
      </body>
    </html>
  );
}
