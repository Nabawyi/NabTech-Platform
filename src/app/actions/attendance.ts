"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AttendanceRecord, SubscriptionRow } from "@/types/domain";
import { getUserSession } from "./students";
import { getActiveStudents } from "./subscriptions";

export async function getAttendance(teacherId?: string): Promise<AttendanceRecord[]> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  let effectiveTeacherId = teacherId;
  if (session.role === "admin" || session.role === "student") effectiveTeacherId = session.teacherId;

  const admin = createAdminClient();
  let query = admin.from("attendance").select("*").order("date", { ascending: false });
  if (effectiveTeacherId) query = query.eq("teacher_id", effectiveTeacherId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    id: r.id,
    studentId: r.student_id,
    teacherId: r.teacher_id,
    date: r.date,
    status: r.status,
    createdAt: r.created_at,
  })) as AttendanceRecord[];
}

export async function markAttendance(studentId: string, date: string, status: "present" | "absent", teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  const normalizedDate = new Date(date).toISOString().split("T")[0];
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("attendance")
    .select("id")
    .eq("student_id", studentId)
    .eq("date", normalizedDate)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (existing) {
    await admin.from("attendance").update({ status }).eq("id", existing.id);
  } else {
    await admin.from("attendance").insert({ student_id: studentId, teacher_id: teacherId, date: normalizedDate, status });
  }
  return true;
}

export async function getAttendanceByDate(date: string, teacherId?: string) {
  const records = await getAttendance(teacherId);
  const normalizedDate = new Date(date).toISOString().split("T")[0];
  return records.filter((r) => r.date === normalizedDate);
}

export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  // ⚠️ Do NOT call getAttendance() — it fetches ALL teacher records then filters in memory.
  // Query directly by student_id using admin to bypass RLS.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (error) return [];

  return (data ?? []).map((r: any) => ({
    id: r.id,
    studentId: r.student_id,
    teacherId: r.teacher_id,
    date: r.date,
    status: r.status,
    createdAt: r.created_at,
  })) as AttendanceRecord[];
}

export async function getAttendanceStats(teacherId?: string) {
  const records = await getAttendance(teacherId);
  const uniqueDates = new Set(records.map((r) => r.date));
  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const todayDate = new Date().toISOString().split("T")[0];
  const todays = records.filter((r) => r.date === todayDate);
  const todayTotalRecords = todays.length;
  const todayPresent = todays.filter((r) => r.status === "present").length;
  const todayAbsent = todays.filter((r) => r.status === "absent").length;

  return {
    totalDays: uniqueDates.size,
    totalRecords,
    presentCount,
    absentCount,
    rate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
    todayDate,
    todayTotalRecords,
    todayPresent,
    todayAbsent,
    todayRate: todayTotalRecords > 0 ? (todayPresent / todayTotalRecords) * 100 : 0,
  };
}

export async function bulkMarkAttendance(idList: string[], date: string, teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  const normalizedDate = new Date(date).toISOString().split("T")[0];
  const activeStudents = (await getActiveStudents(teacherId)) as SubscriptionRow[];
  const admin = createAdminClient();

  // Delete today's records for this teacher first
  await admin.from("attendance").delete().eq("teacher_id", teacherId).eq("date", normalizedDate);

  const idSet = new Set(idList);
  const results = { present: 0, absent: 0, invalid: [] as string[] };

  const rows = activeStudents.map((student: any) => {
    const isPresent = !!student.code && idSet.has(student.code);
    if (isPresent) results.present++;
    else results.absent++;
    return { student_id: student.id, teacher_id: teacherId, date: normalizedDate, status: isPresent ? "present" : "absent" };
  });

  if (rows.length > 0) await admin.from("attendance").insert(rows);

  const activeCodes = new Set(activeStudents.map((s: any) => s.code).filter(Boolean));
  idList.forEach((code) => { if (!activeCodes.has(code)) results.invalid.push(code); });

  return results;
}
