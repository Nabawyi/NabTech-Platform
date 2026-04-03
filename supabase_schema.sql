-- =====================================================================
-- NabTech Platform — Supabase SQL Schema
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- ─── 1. PROFILES (extends auth.users) ─────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('owner','teacher','student')),
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. TEACHERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','inactive','rejected')),
  invite_code TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- ─── 3. TEACHER SETTINGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_settings (
  teacher_id     UUID PRIMARY KEY REFERENCES teachers(id) ON DELETE CASCADE,
  dark_mode      BOOLEAN DEFAULT FALSE,
  enabled_levels TEXT[]  DEFAULT ARRAY['primary','preparatory','secondary'],
  enabled_grades INT[]   DEFAULT ARRAY[1,2,3,4,5,6]
);

-- ─── 4. STUDENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_id   UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  stage        TEXT NOT NULL CHECK (stage IN ('primary','preparatory','secondary')),
  grade        INT  NOT NULL,
  city         TEXT DEFAULT 'غير محدد',
  group_id     UUID,
  password     TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. GROUPS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  start_time    TEXT,
  end_time      TEXT,
  stage         TEXT CHECK (stage IN ('primary','preparatory','secondary')),
  grade         INT,
  location_id   TEXT,
  location_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- FK: students → groups
ALTER TABLE students
  ADD CONSTRAINT IF NOT EXISTS fk_students_group
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- ─── 6. LESSONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  stage       TEXT NOT NULL CHECK (stage IN ('primary','preparatory','secondary')),
  grade       INT  NOT NULL,
  video_url   TEXT DEFAULT '',
  description TEXT DEFAULT '',
  pdf_url     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. QUIZ QUESTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  text      TEXT NOT NULL,
  options   TEXT[] NOT NULL,
  correct   INT NOT NULL CHECK (correct BETWEEN 0 AND 3)
);

-- ─── 8. SUBSCRIPTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date   TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id)
);

-- ─── 9. ATTENDANCE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('present','absent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, date, teacher_id)
);

-- ─── 10. QUIZ RESULTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score      INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results     ENABLE ROW LEVEL SECURITY;

-- profiles: own row only + public read for teachers (for invite code validation)
CREATE POLICY "profiles_self" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_teacher_read" ON profiles FOR SELECT USING (role = 'owner' OR role = 'teacher');

-- teachers: own row only + public read for active
CREATE POLICY "teachers_self" ON teachers FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "teachers_public_read" ON teachers FOR SELECT USING (status = 'active');

-- teacher_settings: own row
CREATE POLICY "teacher_settings_self" ON teacher_settings FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- students: teacher owns their students; student reads own row
CREATE POLICY "students_teacher_read"  ON students FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = auth_id);
CREATE POLICY "students_teacher_write" ON students FOR ALL    USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- groups: teacher owns
CREATE POLICY "groups_teacher" ON groups FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- lessons: teacher owns; students from same teacher can read
CREATE POLICY "lessons_teacher_write" ON lessons FOR ALL    USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "lessons_student_read"  ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM students s WHERE s.auth_id = auth.uid() AND s.teacher_id = lessons.teacher_id AND s.status = 'active')
);

-- quiz_questions: follow lesson access
CREATE POLICY "quiz_q_teacher" ON quiz_questions FOR ALL    USING (EXISTS (SELECT 1 FROM lessons l WHERE l.id = quiz_questions.lesson_id AND l.teacher_id = auth.uid()));
CREATE POLICY "quiz_q_student" ON quiz_questions FOR SELECT USING (EXISTS (
  SELECT 1 FROM lessons l JOIN students s ON s.teacher_id = l.teacher_id
  WHERE l.id = quiz_questions.lesson_id AND s.auth_id = auth.uid() AND s.status = 'active'
));

-- subscriptions: teacher + own student
CREATE POLICY "subs_teacher" ON subscriptions FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "subs_student" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = subscriptions.student_id AND s.auth_id = auth.uid())
);

-- attendance: teacher owns
CREATE POLICY "attendance_teacher" ON attendance FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- quiz_results: student reads own; teacher reads their students
CREATE POLICY "qr_student" ON quiz_results FOR SELECT USING (EXISTS (SELECT 1 FROM students s WHERE s.id = quiz_results.student_id AND s.auth_id = auth.uid()));
CREATE POLICY "qr_teacher" ON quiz_results FOR ALL USING (EXISTS (
  SELECT 1 FROM students s JOIN lessons l ON l.id = quiz_results.lesson_id
  WHERE s.id = quiz_results.student_id AND l.teacher_id = auth.uid()
));

-- =====================================================================
-- SEED: Owner account
-- Create this user first in Supabase Auth → Users → "Add user"
--   Email: owner@nabtech.app
--   Password: owner123
-- Then run this to set their role:
-- =====================================================================

-- INSERT INTO profiles (id, name, role, phone)
-- VALUES ('<REPLACE_WITH_OWNER_AUTH_UUID>', 'مالك المنصة', 'owner', '')
-- ON CONFLICT (id) DO UPDATE SET role = 'owner';
