-- =====================================================================
-- NabTech Platform — Progress Tracking Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- ─── 1. Add last_seen_at to students table ────────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- ─── 2. Student Lesson Progress Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_lessons_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id           UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  has_viewed          BOOLEAN NOT NULL DEFAULT false,
  progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  last_watched_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, lesson_id)
);

-- ─── 3. Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE student_lessons_progress ENABLE ROW LEVEL SECURITY;

-- ─── 4. RLS Policies ──────────────────────────────────────────────────────────

-- Student can read their own progress only
CREATE POLICY "progress_student_read" ON student_lessons_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_lessons_progress.student_id AND s.auth_id = auth.uid())
  );

-- Student can insert/update their own progress only
CREATE POLICY "progress_student_write" ON student_lessons_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_lessons_progress.student_id AND s.auth_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM students s WHERE s.id = student_lessons_progress.student_id AND s.auth_id = auth.uid())
  );

-- Teacher can read progress of their students
CREATE POLICY "progress_teacher_read" ON student_lessons_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_lessons_progress.student_id
        AND s.teacher_id = auth.uid()
    )
  );

-- ─── 5. Fix quiz_questions RLS to allow student read ─────────────────────────
-- Drop old policy and recreate with grade_code enforcement
DROP POLICY IF EXISTS "quiz_q_student" ON quiz_questions;

CREATE POLICY "quiz_q_student" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM lessons l
      JOIN students s ON s.teacher_id = l.teacher_id AND s.grade_code = l.grade_code
      WHERE l.id = quiz_questions.lesson_id
        AND s.auth_id = auth.uid()
        AND s.status = 'active'
    )
  );
