import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getTeacherSettings } from "@/app/actions/settings";
import { redirect } from "next/navigation";
import { getUserSession } from "@/app/actions/students";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin" && session.role !== "teacher") {
    if (session.role === "student") {
      redirect("/student");
    } else if (session.role === "owner") {
      redirect("/owner");
    }
    redirect("/login");
  }

  const settings = await getTeacherSettings();

  return (
    <SettingsProvider initialSettings={settings}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TeacherTopbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SettingsProvider>
  );
}
