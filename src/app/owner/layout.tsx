import { redirect } from "next/navigation";
import { getUserSession, logoutUser } from "@/app/actions/students";
import Link from "next/link";
import { Shield } from "lucide-react";
import ThemeToggleButton from "../../components/ThemeToggleButton";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300" dir="rtl">
      {/* Owner Header */}
      <header className="bg-slate-900 dark:bg-gray-900 border-b border-white/5 dark:border-gray-800 text-white sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">لوحة تحكم المالك</h1>
              <p className="text-xs text-white/50 font-bold">NabTech · إدارة المعلمين والموافقات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all text-white"
            >
              الرئيسية
            </Link>
            <ThemeToggleButton />
            <form
              action={async () => {
                "use server";
                await logoutUser();
                redirect("/login");
              }}
            >
              <button
                type="submit"
                className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-500/20"
              >
                تسجيل خروج
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
