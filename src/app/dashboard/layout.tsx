import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { getUserSession } from "@/app/actions/students";
import { getStudentSubscription } from "@/app/actions/subscriptions";
import SubscriptionGuard from "@/components/dashboard/SubscriptionGuard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  if (!session) return null;

  const sub = session.role === "student" ? await getStudentSubscription(session.id) : null;
  const status = sub?.calculatedStatus || "inactive";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
