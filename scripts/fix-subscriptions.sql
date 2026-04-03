
-- ─── 1. Fix subscriptions table ─────────────────────────────────────────────
-- Ensure the unique constraint exists for student_id (required for upsert)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_student_id_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_student_id_key UNIQUE (student_id);
  END IF;
END $$;

-- ─── 2. Fix RLS Policies (Subscriptions) ────────────────────────────────────
-- Drop existing to ensure a clean slate
DROP POLICY IF EXISTS "subs_teacher" ON subscriptions;
DROP POLICY IF EXISTS "subs_student" ON subscriptions;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow teachers to manage ALL subscriptions of THEIR students
-- We check if the student.teacher_id matches the teacher performing the action
CREATE POLICY "subs_teacher_manage" ON subscriptions
FOR ALL 
USING (
  auth.uid() = teacher_id OR 
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = subscriptions.student_id AND s.teacher_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = teacher_id OR 
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = subscriptions.student_id AND s.teacher_id = auth.uid()
  )
);

-- Allow students to view their own subscription
CREATE POLICY "subs_student_read" ON subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = subscriptions.student_id AND s.auth_id = auth.uid()
  )
);

-- ─── 3. Fix Data Integrity ──────────────────────────────────────────────────
-- Ensure student_id in subscriptions always matches student.teacher_id
-- This update script fixes any existing mismatches
UPDATE subscriptions sub
SET teacher_id = s.teacher_id
FROM students s
WHERE sub.student_id = s.id AND sub.teacher_id != s.teacher_id;
