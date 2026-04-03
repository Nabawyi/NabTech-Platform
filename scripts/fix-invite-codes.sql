-- ─── 1. Allow public to read ACTIVE teachers for invite code validation ───
-- If the policy exists, we drop it first to ensure idempotency.
DROP POLICY IF EXISTS "teachers_public_read" ON teachers;
CREATE POLICY "teachers_public_read" ON teachers FOR SELECT USING (status = 'active');

-- Allow public to read teacher profiles (needed to join teachers with profiles for names)
DROP POLICY IF EXISTS "profiles_teacher_read" ON profiles;
CREATE POLICY "profiles_teacher_read" ON profiles FOR SELECT USING (role = 'owner' OR role = 'teacher');

-- ─── 2. Normalize existing invite codes to be uppercase and trimmed ────────
UPDATE teachers 
SET invite_code = UPPER(TRIM(invite_code))
WHERE invite_code IS NOT NULL;

-- ─── 3. Reload Schema Cache ────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
