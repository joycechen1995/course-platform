import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">建立帳號</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        已經有帳號了？{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          前往登入
        </Link>
      </p>
    </div>
  );
}
