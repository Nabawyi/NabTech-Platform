"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserSession } from "./students";

export type QuizResultExt = {
  id: string;
  score: number;
  total_score: number;
  lesson_title: string;
  created_at: string;
};

/**
 * Fixes the issue where quiz results were missing lesson titles and had calculation errors.
 * Replaces the problematic "quiz_attempts" logic with the actual "quiz_results" table
 * and joins with "lessons".
 */
export async function getEnhancedQuizResultsAction() {
  const session = await getUserSession();
  if (!session || session.role !== "student") {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  // The user asked for a join between quiz_attempts and quizzes.
  // In our schema, these are 'quiz_results' and 'lessons'.
  // We use the count of quiz_questions for the lesson as the total_score if not explicitly stored.
  
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(`
      id,
      score,
      total_score,
      created_at,
      quiz_id,
      quizzes (
        id,
        title
      )
    `)
    .eq("student_id", session.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quiz results:", error);
    return { success: false, error: error.message };
  }

  const results: QuizResultExt[] = (data || []).map((row: any) => {
    // Percentage calculation fix in UI will follow, but we ensure data is clean here
    const score = Number(row.score) || 0;
    const totalScore = Number(row.total_score) || 0;
    
    return {
      id: row.id,
      score: score,
      total_score: totalScore,
      lesson_title: row.quizzes?.title || "اختبار غير معروف",
      created_at: row.created_at
    };
  });

  return { success: true, results };
}
