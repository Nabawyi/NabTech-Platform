-- ─── Add student_code column and constraints ─────────────────────────────────

-- 1. Add the column securely
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_code TEXT;

-- 2. Add Unique constraint so a teacher never has duplicates
ALTER TABLE students DROP CONSTRAINT IF EXISTS uq_student_code_teacher;
ALTER TABLE students ADD CONSTRAINT uq_student_code_teacher UNIQUE (teacher_id, student_code);

-- 3. Force cache reload
NOTIFY pgrst, 'reload schema';
