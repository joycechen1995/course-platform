import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
        ✓
      </div>
      <h1 className="text-2xl font-bold">付款成功！</h1>
      <p className="mt-2 text-slate-600">
        課程權限已經自動開通，現在就可以開始學習了。
      </p>
      <div className="mt-8 flex justify-center gap-4">
        {slug && (
          <Link
            href={`/learn/${slug}`}
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            開始學習
          </Link>
        )}
        <Link
          href="/account"
          className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm text-slate-700 hover:bg-slate-100"
        >
          前往會員中心
        </Link>
      </div>
    </div>
  );
}
