"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserSession } from "@/app/actions/students";
import type { StudentScoreEntry, StudentResultRow, StudentExamEntry } from "@/types/domain";

// ─── Bulk Upsert Scores (Teacher saves exam results) ──────────────────────────
/**
 * Called by teacher when submitting grades for an exam.
 * Each entry: { exam_id, student_id, score }
 * student_id = the primary key from the `students` table (not auth.uid()).
 *
 * RLS requirement on exam_results:
 *   INSERT/UPDATE: auth.uid() = (SELECT teacher_id FROM exams WHERE id = exam_id)
 */
export async function bulkUpsertScores(
  entries: StudentScoreEntry[]
): Promise<{ success: boolean; error?: string }> {
  const session = await getUserSession();

  // role "admin" = teacher in this system's session mapping
  if (!session || session.role !== "admin") {
    console.error("[bulkUpsertScores] Unauthorized — role:", session?.role);
    return { success: false, error: "Unauthorized" };
  }

  if (!entries.length) return { success: true };

  // Filter out entries with null scores so we only upsert real grades
  const validEntries = entries.filter((e) => e.score !== null);
  if (!validEntries.length) return { success: true };

  // Use admin client so RLS does NOT block teacher inserts.
  // Application-level auth guard above already validates the teacher.
  const admin = createAdminClient();

  console.log(
    `[bulkUpsertScores] teacher=${session.teacherId} upserting ${validEntries.length} scores`
  );

  const { data, error } = await admin
    .from("exam_results")
    .upsert(validEntries, { onConflict: "exam_id,student_id" })
    .select("id, exam_id, student_id, score");

  if (error) {
    console.error("[bulkUpsertScores] Supabase error:", error);
    return { success: false, error: error.message };
  }

  console.log("[bulkUpsertScores] inserted/updated rows:", data?.length ?? 0);
  return { success: true };
}

// ─── Get Results For Exam (teacher view — score-entry page) ───────────────────
/**
 * Returns existing scores for one exam, joined with student names.
 * Used by teacher on /teacher/quizzes/[quizId] to pre-fill the score table.
 *
 * Uses admin client so we can read across all students.
 */
export async function getResultsForExam(
  examId: string
): Promise<StudentExamEntry[]> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("exam_results")
    .select("id, student_id, score, students(name)")
    .eq("exam_id", examId);

  if (error) {
    console.error("[getResultsForExam] error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map((r: any) => ({
    student_id: r.student_id,
    student_name: r.students?.name ?? "غير معروف",
    result_id: r.id,
    score: r.score,
  }));
}

// ─── Get Results For Student (student view — quiz results page) ───────────────
/**
 * Returns all exam results for the currently logged-in student.
 * Joins exam_results → exams to get title, type, total_score.
 *
 * CRITICAL:
 *   - session.id = students table primary key (UUID), NOT auth.uid()
 *   - Supabase RLS on exam_results must allow:
 *       SELECT USING (
 *         student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
 *       )
 *   - We use the regular (anon/user) client so RLS is enforced.
 */
export async function getResultsForStudent(): Promise<StudentResultRow[]> {
  const session = await getUserSession();

  if (!session || session.role !== "student") {
    console.error(
      "[getResultsForStudent] Unauthorized — role:",
      session?.role
    );
    throw new Error("Unauthorized");
  }

  console.log(
    "[getResultsForStudent] fetching for student_id:",
    session.id
  );

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_results")
    .select(`
      id,
      exam_id,
      score,
      created_at,
      exams(title, type, total_score)
    `)
    .eq("student_id", session.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getResultsForStudent] Supabase error:", error);
    throw new Error(error.message);
  }

  console.log(
    "[getResultsForStudent] rows returned:",
    (data ?? []).length
  );

  return (data ?? []).map((r: any) => ({
    result_id: r.id,
    exam_id: r.exam_id,
    exam_title: r.exams?.title ?? "—",
    exam_type: r.exams?.type ?? "quiz",
    total_score: r.exams?.total_score ?? 0,
    score: r.score,
    created_at: r.created_at,
  }));
}

// ─── Upsert Single Score By Student Code ──────────────────────────────────────
export async function upsertScoreByStudentCode(
  examId: string,
  studentCode: string,
  score: number
): Promise<{ success: boolean; error?: string; studentName?: string }> {
  const session = await getUserSession();
  if (!session || session.role !== "admin") return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();

  // 1. Find the student by code and teacher_id
  const { data: student, error: studentError } = await admin
    .from("students")
    .select("id, name")
    .eq("student_code", studentCode.trim())
    .eq("teacher_id", session.teacherId)
    .single();

  if (studentError || !student) {
    return { success: false, error: "الطالب غير موجود أو ليس مسجلاً لديك" };
  }

  // 2. Lookup the exam to check total_score
  const { data: exam, error: examError } = await admin
    .from("exams")
    .select("total_score")
    .eq("id", examId)
    .single();

  if (examError || !exam) {
    return { success: false, error: "الاختبار غير موجود" };
  }

  if (score > exam.total_score) {
    return { success: false, error: `الدرجة لا يمكن أن تتخطى الدرجة النهائية (${exam.total_score})` };
  }

  // 3. Upsert the score
  const { error: upsertError } = await admin
    .from("exam_results")
    .upsert({
      exam_id: examId,
      student_id: student.id,
      score: score
    }, { onConflict: "exam_id,student_id" });

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  return { success: true, studentName: student.name };
}
