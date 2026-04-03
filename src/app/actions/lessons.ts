"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SchoolLevel, getGradeLabel } from "@/lib/constants";
import { normalizeStageGrade, getGradeCode } from "@/lib/education";
import { getUserSession } from "./students";

export type QuizQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
};

export type Lesson = {
  id: string;
  teacherId: string;
  title: string;
  level: SchoolLevel;
  gradeNumber: number;
  grade?: string;
  videoUrl: string;
  description: string;
  pdfUrl?: string;
  questions: QuizQuestion[];
  gradeCode?: string;
  createdAt?: string;
};

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    title: row.title,
    level: row.stage as SchoolLevel,
    gradeNumber: row.grade,
    grade: getGradeLabel(row.stage as SchoolLevel, row.grade),
    videoUrl: row.video_url ?? "",
    description: row.description ?? "",
    pdfUrl: row.pdf_url ?? "",
    questions: row.quiz_questions ?? [],
    gradeCode: row.grade_code ?? getGradeCode(row.stage, row.grade),
    createdAt: row.created_at,
  };
}

export async function getLessons(teacherId?: string): Promise<Lesson[]> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");

  const supabase = await createClient();
  let effectiveTeacherId = teacherId;
  if (session.role === "student" || session.role === "admin") effectiveTeacherId = session.teacherId;

  let query = supabase
    .from("lessons")
    .select("*, quiz_questions(*)")
    .order("created_at", { ascending: false });

  if (effectiveTeacherId) query = query.eq("teacher_id", effectiveTeacherId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapLesson);
}

export async function getLessonsByLevelAndGrade(level: SchoolLevel, gradeNumber: number, teacherId?: string): Promise<Lesson[]> {
  const lessons = await getLessons(teacherId);
  return lessons.filter((l) => l.level === level && l.gradeNumber === gradeNumber);
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*, quiz_questions(*)")
    .eq("id", id)
    .single();

  if (!data) return null;
  if ((session.role === "student" || session.role === "admin") && data.teacher_id !== session.teacherId) return null;
  return mapLesson(data);
}

export async function addLesson(lessonData: Omit<Lesson, "id" | "createdAt">): Promise<Lesson> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && lessonData.teacherId !== session.teacherId) throw new Error("Unauthorized");

  const valid = normalizeStageGrade(lessonData.level, lessonData.gradeNumber);
  if (!valid) throw new Error("يجب اختيار مرحلة وصف دراسي صالحين للدرس");

  const admin = createAdminClient();

  const { data: lesson, error } = await admin.from("lessons").insert({
    teacher_id: lessonData.teacherId,
    title: lessonData.title,
    stage: valid.stage,
    grade: valid.grade,
    grade_code: getGradeCode(valid.stage, valid.grade),
    video_url: lessonData.videoUrl ?? "",
    description: lessonData.description ?? "",
    pdf_url: lessonData.pdfUrl ?? "",
  }).select().single();

  if (error) throw new Error(error.message);

  // Insert quiz questions
  if (lessonData.questions && lessonData.questions.length > 0) {
    await admin.from("quiz_questions").insert(
      lessonData.questions.map((q) => ({
        lesson_id: lesson.id,
        text: q.text,
        options: q.options,
        correct: q.correct,
      }))
    );
  }

  return mapLesson({ ...lesson, quiz_questions: lessonData.questions ?? [] });
}

export async function updateLesson(id: string, data: Partial<Omit<Lesson, "id" | "createdAt">>): Promise<boolean> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { data: existing } = await admin.from("lessons").select("teacher_id, stage, grade").eq("id", id).single();
  if (!existing) return false;
  if (session.role === "admin" && existing.teacher_id !== session.teacherId) throw new Error("Unauthorized");

  const stage = data.level ?? existing.stage;
  const grade = data.gradeNumber ?? existing.grade;
  const valid = normalizeStageGrade(stage, grade);
  if (!valid) return false;

  const { error } = await admin.from("lessons").update({
    title: data.title,
    stage: valid.stage,
    grade: valid.grade,
    grade_code: getGradeCode(valid.stage, valid.grade),
    video_url: data.videoUrl,
    description: data.description,
    pdf_url: data.pdfUrl,
  }).eq("id", id);

  if (error) throw new Error(error.message);

  // Replace questions if provided
  if (data.questions) {
    await admin.from("quiz_questions").delete().eq("lesson_id", id);
    if (data.questions.length > 0) {
      await admin.from("quiz_questions").insert(
        data.questions.map((q) => ({
          lesson_id: id,
          text: q.text,
          options: q.options,
          correct: q.correct,
        }))
      );
    }
  }

  return true;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { data: lesson } = await admin.from("lessons").select("teacher_id").eq("id", id).single();
  if (!lesson) return false;
  if (session.role === "admin" && lesson.teacher_id !== session.teacherId) throw new Error("Unauthorized");

  const { error } = await admin.from("lessons").delete().eq("id", id);
  return !error;
}
