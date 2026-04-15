"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserSession } from "@/app/actions/students";
import type { ExamRow, StudentExamEntry } from "@/types/domain";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateExamPayload {
  title: string;
  type: "quiz" | "midterm" | "final";
  total_score: number;
  grade_code: string;
}

export interface GetStudentsForGradeOptions {
  gradeCode: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedStudents {
  items: StudentExamEntry[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Create Exam ──────────────────────────────────────────────────────────────

export async function createExam(payload: CreateExamPayload): Promise<ExamRow> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .insert({
      title: payload.title.trim(),
      type: payload.type,
      total_score: payload.total_score,
      grade_code: payload.grade_code,
      teacher_id: session.teacherId,
    })
    .select("id, title, type, total_score, grade_code, teacher_id, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as ExamRow;
}

// ─── Get Exams By Teacher (paginated) ────────────────────────────────────────

export async function getExamsByTeacher(): Promise<ExamRow[]> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select("id, title, type, total_score, grade_code, teacher_id, created_at")
    .eq("teacher_id", session.teacherId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ExamRow[];
}

// ─── Get Single Exam ──────────────────────────────────────────────────────────

export async function getExamById(examId: string): Promise<ExamRow | null> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select("id, title, type, total_score, grade_code, teacher_id, created_at")
    .eq("id", examId)
    .eq("teacher_id", session.teacherId) // RLS double-check
    .single();

  if (error) return null;
  return data as ExamRow;
}

// ─── Delete Exam ──────────────────────────────────────────────────────────────

export async function deleteExam(examId: string): Promise<void> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("exams")
    .delete()
    .eq("id", examId)
    .eq("teacher_id", session.teacherId);

  if (error) throw new Error(error.message);
}

// ─── Get Students For Grade (paginated + search) ──────────────────────────────

export async function getStudentsForGrade(
  opts: GetStudentsForGradeOptions
): Promise<PaginatedStudents> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const { gradeCode, page = 1, limit = 20, search = "" } = opts;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const admin = createAdminClient();

  let query = admin
    .from("students")
    .select("id, name", { count: "exact" })
    .eq("teacher_id", session.teacherId)
    .eq("grade_code", gradeCode)
    .eq("status", "active")
    .order("name", { ascending: true })
    .range(from, to);

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const items: StudentExamEntry[] = (data ?? []).map((s: any) => ({
    student_id: s.id,
    student_name: s.name,
    result_id: null,
    score: null,
  }));

  const total = count ?? 0;

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
