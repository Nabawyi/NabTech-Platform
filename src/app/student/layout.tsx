import Sidebar from "@/components/student/Sidebar";
import Topbar from "@/components/student/Topbar";
import { getUserSession } from "@/app/actions/students";
import { getStudentSubscription } from "@/app/actions/subscriptions";
import SubscriptionGuard from "@/components/student/SubscriptionGuard";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    // If teacher tries to access student, redirect to teacher
    if (session.role === "admin" || session.role === "teacher") {
      redirect("/teacher");
    } else if (session.role === "owner") {
      redirect("/owner");
    }
    redirect("/login");
  }

  const sub = await getStudentSubscription(session.id);
  const status = sub?.calculatedStatus || "inactive";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SubscriptionGuard status={status} role={session.role} />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar session={session} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
