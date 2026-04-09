"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubscriptionStatus } from "@/app/actions/subscriptions";

export default function SubscriptionGuard({ 
  status, 
  role 
}: { 
  status: SubscriptionStatus;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (role !== "student") return;

    const isInvalid = status !== "active" && status !== "expiring_soon";
    const isLessonsPath = pathname.startsWith("/student/lessons");
    const isRequiredPage = pathname === "/student/subscription-required";

    if (isInvalid && isLessonsPath && !isRequiredPage) {
      router.replace("/student/subscription-required");
    }
  }, [pathname, status, role, router]);

  return null;
}
