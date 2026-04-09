"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Subscription, SubscriptionRow, SubscriptionStatus } from "@/types/domain";
import { getStudents, getUserSession } from "./students";
import { revalidatePath } from "next/cache";

export type { Subscription, SubscriptionStatus } from "@/types/domain";

function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

export async function getSubscriptions(teacherId?: string): Promise<SubscriptionRow[]> {
  const students = await getStudents(teacherId);
  const supabase = await createClient();

  const studentIds = students.map((s: any) => s.id);
  if (studentIds.length === 0) return [];

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .in("student_id", studentIds);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return students.map((s: any) => {
    const sub = (subs ?? []).find((sub: any) => sub.student_id === s.id);
    let calculatedStatus: SubscriptionStatus = "inactive";
    let daysRemaining = 0;

    if (sub && sub.status === "active") {
      const end = new Date(sub.end_date);
      const diffTime = end.getTime() - today.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      if (diffTime < 0) { calculatedStatus = "expired"; daysRemaining = 0; }
      else if (daysRemaining <= 3) calculatedStatus = "expiring_soon";
      else calculatedStatus = "active";
    } else if (sub && sub.status === "inactive") {
      calculatedStatus = "inactive";
    }

    return {
      ...s,
      subscription: sub ? { 
        ...sub, 
        studentId: sub.student_id, 
        startDate: sub.start_date, 
        endDate: sub.end_date, 
        renewalDate: sub.renewal_date 
      } : null,
      calculatedStatus,
      daysRemaining,
    } as unknown as SubscriptionRow;
  });
}

export async function activateSubscription(studentId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) {
    throw new Error("Unauthorized: Teacher session missing");
  }

  const admin = createAdminClient();
  
  // Verify ownership and get latest student info
  const { data: student, error: studentError } = await admin
    .from("students")
    .select("teacher_id, name")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    console.error("[activateSubscription] Error fetching student:", studentError);
    throw new Error("Student not found for activation");
  }

  // Multi-tenant check
  if (session.role === "admin" && student.teacher_id !== session.teacherId) {
    throw new Error("Unauthorized: Student does not belong to you");
  }

  const startDate = new Date();
  const endDate = getLastDayOfMonth(startDate); // Requirements: end of current month

  console.log(`[activateSubscription] Activating for ${student.name} (${studentId}) until ${endDate.toISOString()}`);

  const { error: upsertError } = await admin.from("subscriptions").upsert({
    student_id: studentId,
    teacher_id: student.teacher_id,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    renewal_date: startDate.toISOString(),
    status: "active",
  }, { 
    onConflict: "student_id" 
  });

  if (upsertError) {
    console.error("[activateSubscription] DB Error:", upsertError);
    throw new Error(`Failed to activate subscription: ${upsertError.message}`);
  }

  revalidatePath("/teacher/subscriptions");
  return { success: true };
}

export async function renewSubscription(studentId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) {
    throw new Error("Unauthorized: Teacher session missing");
  }

  const admin = createAdminClient();

  // Verify ownership
  const { data: student, error: studentError } = await admin
    .from("students")
    .select("teacher_id, name")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    throw new Error("Student not found for renewal");
  }

  if (session.role === "admin" && student.teacher_id !== session.teacherId) {
    throw new Error("Unauthorized: Student does not belong to you");
  }

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!existing) {
    console.log("[renewSubscription] No existing subscription found for student. Redirecting to activation.");
    return activateSubscription(studentId);
  }

  const startDate = new Date();
  const newEnd = getLastDayOfMonth(startDate);

  console.log(`[renewSubscription] Renewing for ${student.name} (${studentId}) until ${newEnd.toISOString()}`);

  const { error: updateError } = await admin
    .from("subscriptions")
    .update({
      end_date: newEnd.toISOString(),
      renewal_date: startDate.toISOString(),
      status: "active",
      teacher_id: student.teacher_id // Ensure teacher_id is always sync
    })
    .eq("student_id", studentId);

  if (updateError) {
    console.error("[renewSubscription] DB Error:", updateError);
    throw new Error(`Failed to renew subscription: ${updateError.message}`);
  }

  revalidatePath("/teacher/subscriptions");
  return { success: true };
}

export async function deactivateSubscription(studentId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").update({ status: "inactive" }).eq("student_id", studentId);
  if (error) return { success: false };
  return { success: true };
}

export async function getActiveStudents(teacherId?: string): Promise<SubscriptionRow[]> {
  const students = await getSubscriptions(teacherId);
  return students
    .filter((s: any) => s.calculatedStatus === "active" || s.calculatedStatus === "expiring_soon")
    .map((s: any) => ({ ...s, isActive: true })) as SubscriptionRow[];
}

export async function getStudentSubscription(studentId: string): Promise<SubscriptionRow | null> {
  // ⚠️ CRITICAL: Do NOT call getSubscriptions() here — it calls getStudents()
  // which throws "Unauthorized" for student role. Query DB directly instead.
  const admin = createAdminClient();

  const [{ data: student }, { data: sub }] = await Promise.all([
    admin.from("students").select("*").eq("id", studentId).single(),
    admin.from("subscriptions").select("*").eq("student_id", studentId).maybeSingle(),
  ]);

  if (!student) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let calculatedStatus: SubscriptionStatus = "inactive";
  let daysRemaining = 0;

  if (sub && sub.status === "active") {
    const end = new Date(sub.end_date);
    const diffTime = end.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    if (diffTime < 0) { calculatedStatus = "expired"; daysRemaining = 0; }
    else if (daysRemaining <= 3) calculatedStatus = "expiring_soon";
    else calculatedStatus = "active";
  } else if (sub && sub.status === "inactive") {
    calculatedStatus = "inactive";
  }

  return {
    id: student.id,
    teacherId: student.teacher_id,
    name: student.name,
    phone: student.phone,
    parentPhone: student.parent_phone,
    status: student.status,
    stage: student.stage,
    grade: student.grade,
    gradeNumber: student.grade,
    code: student.student_code ?? "",
    subscription: sub ? {
      studentId: sub.student_id,
      teacherId: sub.teacher_id,
      startDate: sub.start_date,
      endDate: sub.end_date,
      renewalDate: sub.renewal_date,
      status: sub.status,
    } : null,
    calculatedStatus,
    daysRemaining,
  } as unknown as SubscriptionRow;
}
