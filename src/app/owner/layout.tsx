import { redirect } from "next/navigation";
import { getUserSession, logoutUser } from "@/app/actions/students";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session || session.role !== "owner") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Owner Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-sm">
              👑
            </div>
            <div>
              <h1 className="text-lg font-black">لوحة تحكم المالك</h1>
              <p className="text-xs text-white/50 font-bold">إدارة المعلمين والموافقات</p>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await logoutUser();
            redirect("/login");
          }}>
            <button
              type="submit"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
            >
              تسجيل خروج
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
