import { adminListStudents } from "@/lib/data/courses";

export default async function AdminStudentsPage() {
  const students = await adminListStudents();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">學生名單</h1>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">姓名</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">已購課程數</th>
              <th className="px-4 py-3">累積消費</th>
              <th className="px-4 py-3">加入時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  還沒有學生註冊
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.courses_count}</td>
                <td className="px-4 py-3">NT$ {s.total_spent.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{s.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
