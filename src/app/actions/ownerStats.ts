"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type TeacherStats = {
  teacherId: string;
  studentCount: number;
  groupCount: number;
};

/**
 * Efficient bulk fetch: gets student & group counts for ALL teachers
 * in two queries instead of N+1.
 */
export async function getAllTeacherStats(): Promise<TeacherStats[]> {
  const admin = createAdminClient();

  const [studentsRes, groupsRes] = await Promise.all([
    admin.from("students").select("teacher_id"),
    admin.from("groups").select("teacher_id"),
  ]);

  // Build count maps
  const studentCounts: Record<string, number> = {};
  for (const s of studentsRes.data ?? []) {
    if (s.teacher_id) studentCounts[s.teacher_id] = (studentCounts[s.teacher_id] ?? 0) + 1;
  }

  const groupCounts: Record<string, number> = {};
  for (const g of groupsRes.data ?? []) {
    if (g.teacher_id) groupCounts[g.teacher_id] = (groupCounts[g.teacher_id] ?? 0) + 1;
  }

  // Merge into a unified list of teacher IDs seen in either table
  const allIds = new Set([
    ...Object.keys(studentCounts),
    ...Object.keys(groupCounts),
  ]);

  return Array.from(allIds).map((id) => ({
    teacherId: id,
    studentCount: studentCounts[id] ?? 0,
    groupCount: groupCounts[id] ?? 0,
  }));
}
