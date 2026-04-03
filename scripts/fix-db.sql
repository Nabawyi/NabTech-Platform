-- ─── 1. Add missing columns to core tables ────────────────────────────────────
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS grade_code TEXT;
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS end_time   TEXT;
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS stage      TEXT CHECK (stage IN ('primary','preparatory','secondary'));
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS grade      INT;
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS location_id   TEXT;
ALTER TABLE groups   ADD COLUMN IF NOT EXISTS location_name TEXT;

ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_code TEXT;
ALTER TABLE lessons  ADD COLUMN IF NOT EXISTS grade_code TEXT;

-- ─── 2. Update teacher_settings to use grade_codes ───────────────────────────
ALTER TABLE teacher_settings ADD COLUMN IF NOT EXISTS enabled_grade_codes TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ─── 3. Migration: Populate grade_code from stage + grade ────────────────────
-- pri_1 through pri_6, pre_1 to pre_3, sec_1 to sec_3

UPDATE groups SET grade_code = 
  CASE 
    WHEN stage = 'primary'     THEN 'pri_' || grade
    WHEN stage = 'preparatory' THEN 'pre_' || grade
    WHEN stage = 'secondary'   THEN 'sec_' || grade
    ELSE NULL
  END;

UPDATE students SET grade_code = 
  CASE 
    WHEN stage = 'primary'     THEN 'pri_' || grade
    WHEN stage = 'preparatory' THEN 'pre_' || grade
    WHEN stage = 'secondary'   THEN 'sec_' || grade
    ELSE NULL
  END;

UPDATE lessons SET grade_code = 
  CASE 
    WHEN stage = 'primary'     THEN 'pri_' || grade
    WHEN stage = 'preparatory' THEN 'pre_' || grade
    WHEN stage = 'secondary'   THEN 'sec_' || grade
    ELSE NULL
  END;

-- ─── 4. Migrate teacher_settings: enabled_grades INT[] → enabled_grade_codes TEXT[] ───
-- This is tricky because we don't know the stages for the enabled grades without checking level.
-- But since we're refactoring the UI to use explicit codes, we can initialize this with 
-- all currently mapped codes for that teacher.

-- Helper: Populate current grade_codes for each teacher based on their enabled_grades and enabled_levels
DO $$
DECLARE
    r RECORD;
    stage_text TEXT;
    grade_int INT;
    codes TEXT[];
BEGIN
    FOR r IN SELECT teacher_id, enabled_levels, enabled_grades FROM teacher_settings LOOP
        codes := ARRAY[]::TEXT[];
        FOREACH stage_text IN ARRAY r.enabled_levels LOOP
            FOREACH grade_int IN ARRAY r.enabled_grades LOOP
                -- Only add if it's a valid grade for that stage
                IF (stage_text = 'primary' AND grade_int BETWEEN 1 AND 6) OR
                   (stage_text IN ('preparatory', 'secondary') AND grade_int BETWEEN 1 AND 3) THEN
                    codes := array_append(codes, 
                        CASE stage_text 
                            WHEN 'primary'     THEN 'pri_' 
                            WHEN 'preparatory' THEN 'pre_' 
                            WHEN 'secondary'   THEN 'sec_' 
                        END || grade_int);
                END IF;
            END LOOP;
        END LOOP;
        
        UPDATE teacher_settings 
        SET enabled_grade_codes = codes 
        WHERE teacher_id = r.teacher_id;
    END LOOP;
END $$;

-- ─── 5. Cleanup (Optional: keep old columns for now but mark as deprecated) ──────
-- COMMENT ON COLUMN teacher_settings.enabled_grades IS 'DEPRECATED: Use enabled_grade_codes';
