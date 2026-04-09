import { redirect } from "next/navigation";
import { getUserSession } from "@/app/actions/students";

/**
 * Fallback /dashboard route to handle any legacy links OR manual navigation.
 * Redirects user to their appropriate role-based dashboard.
 */
export default async function DashboardFallbackPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "owner") {
    redirect("/owner");
  } else if (session.role === "admin") {
    redirect("/teacher");
  } else if (session.role === "student") {
    redirect("/student");
  }

  // Final fallback if role is unknown
  redirect("/login");
}
