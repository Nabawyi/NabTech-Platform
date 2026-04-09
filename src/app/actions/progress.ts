"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserSession } from "./students";

export type LessonProgress = {
  studentId: string;
  lessonId: string;
  hasViewed: boolean;
  progressPercentage: number;
  lastWatchedAt: string | null;
};

// ─── Get progress for a single lesson ─────────────────────────────────────────

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
  const session = await getUserSession();
  if (!session || session.role !== "student") return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("student_lessons_progress")
    .select("*")
    .eq("student_id", session.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!data) return null;
  return {
    studentId: data.student_id,
    lessonId: data.lesson_id,
    hasViewed: data.has_viewed,
    progressPercentage: data.progress_percentage,
    lastWatchedAt: data.last_watched_at,
  };
}

// ─── Get progress for all lessons ─────────────────────────────────────────────

export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  const session = await getUserSession();
  if (!session || session.role !== "student") return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("student_lessons_progress")
    .select("*")
    .eq("student_id", session.id);

  return (data ?? []).map((row: any) => ({
    studentId: row.student_id,
    lessonId: row.lesson_id,
    hasViewed: row.has_viewed,
    progressPercentage: row.progress_percentage,
    lastWatchedAt: row.last_watched_at,
  }));
}

// ─── Mark lesson as viewed (upsert) ───────────────────────────────────────────

export async function markLessonViewed(lessonId: string): Promise<void> {
  const session = await getUserSession();
  if (!session || session.role !== "student") return;

  // Use admin to bypass RLS for upsert
  const admin = createAdminClient();
  await admin.from("student_lessons_progress").upsert(
    {
      student_id: session.id,
      lesson_id: lessonId,
      has_viewed: true,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id", ignoreDuplicates: false }
  );
}

// ─── Update lesson progress percentage ────────────────────────────────────────

export async function updateLessonProgress(lessonId: string, percentage: number): Promise<void> {
  const session = await getUserSession();
  if (!session || session.role !== "student") return;

  const clampedPct = Math.max(0, Math.min(100, Math.round(percentage)));
  const admin = createAdminClient();
  await admin.from("student_lessons_progress").upsert(
    {
      student_id: session.id,
      lesson_id: lessonId,
      has_viewed: true,
      progress_percentage: clampedPct,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id", ignoreDuplicates: false }
  );
}

// ─── Update student last_seen_at ───────────────────────────────────────────────

export async function touchLastSeen(): Promise<void> {
  const session = await getUserSession();
  if (!session || session.role !== "student") return;

  const admin = createAdminClient();
  await admin
    .from("students")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", session.id);
}
