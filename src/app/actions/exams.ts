"use server";

import * as ExamsService from "@/services/exams.service";
import * as ExamResultsService from "@/services/examResults.service";
import { revalidatePath } from "next/cache";
import { type StudentScoreEntry } from "@/types/domain";

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function createExamAction(payload: ExamsService.CreateExamPayload) {
  try {
    const exam = await ExamsService.createExam(payload);
    revalidatePath("/teacher/quizzes");
    return { success: true, exam };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTeacherExamsAction() {
  try {
    const exams = await ExamsService.getExamsByTeacher();
    return { success: true, exams };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExamByIdAction(examId: string) {
  try {
    const exam = await ExamsService.getExamById(examId);
    return { success: true, exam };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExamAction(examId: string) {
  try {
    await ExamsService.deleteExam(examId);
    revalidatePath("/teacher/quizzes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Students for Grade ────────────────────────────────────────────────────────

export async function getStudentsForGradeAction(opts: ExamsService.GetStudentsForGradeOptions) {
  try {
    const data = await ExamsService.getStudentsForGrade(opts);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Results ──────────────────────────────────────────────────────────────────

export async function saveScoresAction(entries: StudentScoreEntry[]) {
  try {
    const result = await ExamResultsService.bulkUpsertScores(entries);
    if (result.success) {
      // Revalidate the specific exam page if needed, or the student results
      revalidatePath("/student/quiz");
    }
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getResultsByExamAction(examId: string) {
  try {
    const results = await ExamResultsService.getResultsForExam(examId);
    return { success: true, results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentResultsAction() {
  try {
    const results = await ExamResultsService.getResultsForStudent();
    return { success: true, results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
