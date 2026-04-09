import {
  EDUCATION_LEVELS,
  type SchoolLevel,
  getGradeLabel,
  getGradeCode,
} from "@/lib/constants";

export { getGradeCode };

/** Canonical domain name for education tier (matches API / DB field `stage`). */
export type Stage = SchoolLevel;


const STAGES: Stage[] = ["primary", "preparatory", "secondary"];

export function isStage(s: unknown): s is Stage {
  return typeof s === "string" && (STAGES as string[]).includes(s);
}

/** Single source of truth for valid numeric grades per stage. */
export function getValidGrades(stage: Stage): number[] {
  const level = EDUCATION_LEVELS.find((l) => l.id === stage);
  return level ? level.grades.map((g) => g.number) : [];
}

export function clampGradeForStage(stage: Stage, grade: number): number {
  const valid = getValidGrades(stage);
  if (valid.length === 0) return 1;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return Math.min(max, Math.max(min, Math.round(grade)));
}

export function isValidStageGrade(stage: Stage, grade: number): boolean {
  return getValidGrades(stage).includes(grade);
}

/** Returns normalized stage+grade or null if inputs cannot form a valid pair. */
export function normalizeStageGrade(
  stage: unknown,
  grade: unknown
): { stage: Stage; grade: number } | null {
  if (!isStage(stage)) return null;
  const n = typeof grade === "number" ? grade : Number(grade);
  if (!Number.isFinite(n)) return null;
  const g = clampGradeForStage(stage, n);
  return { stage, grade: g };
}

export function parseGradeCode(code: string): { stage: Stage; grade: number } | null {
  const parts = code.split("_");
  if (parts.length !== 2) return null;
  const stageMap: Record<string, Stage> = { pri: "primary", pre: "preparatory", sec: "secondary" };
  const stage = stageMap[parts[0]];
  const grade = parseInt(parts[1], 10);
  if (!stage || isNaN(grade) || !isValidStageGrade(stage, grade)) return null;
  return { stage, grade };
}


/**
 * Infer stage + grade from legacy Arabic `grade` string (e.g. "الثالث الثانوي").
 */
export function inferStageGradeFromLegacyString(
  gradeStr: unknown
): { stage: Stage; grade: number } | null {
  if (gradeStr == null || typeof gradeStr !== "string") return null;
  const g = gradeStr.trim();
  if (!g) return null;

  let stage: Stage = "secondary";
  if (g.includes("ابتدائي") || g.includes("الابتدائي")) stage = "primary";
  else if (g.includes("إعدادي") || g.includes("الإعدادي")) stage = "preparatory";
  else if (g.includes("ثانوي") || g.includes("الثانوي")) stage = "secondary";

  let num = 1;
  if (g.includes("السادس")) num = 6;
  else if (g.includes("الخامس")) num = 5;
  else if (g.includes("الرابع")) num = 4;
  else if (g.includes("الثالث")) num = 3;
  else if (g.includes("الثاني")) num = 2;
  else if (g.includes("الأول")) num = 1;

  return { stage, grade: clampGradeForStage(stage, num) };
}

export type NormalizedStudentFields = {
  stage: Stage | null;
  grade: number | null;
  level: Stage | null;
  gradeNumber: number | null;
  gradeCode: string;
  /** Display label; empty when stage/grade unknown */
  gradeLabel: string;
};

/**
 * Normalize a raw student record: enforce stage+grade, sync legacy `level` / `gradeNumber` / Arabic `grade`.
 */
export function normalizeStudentRecord(
  raw: Record<string, unknown>
): Record<string, unknown> & NormalizedStudentFields {
  let stage: Stage | null = isStage(raw.stage) ? raw.stage : isStage(raw.level) ? raw.level : null;

  let gradeNum: number | null = null;
  if (typeof raw.grade === "number" && Number.isFinite(raw.grade)) {
    gradeNum = raw.grade;
  } else if (typeof raw.gradeNumber === "number" && Number.isFinite(raw.gradeNumber)) {
    gradeNum = raw.gradeNumber;
  } else if (typeof raw.grade === "string" && /^\d+$/.test(raw.grade.trim())) {
    gradeNum = parseInt(raw.grade, 10);
  }

  if (stage && gradeNum != null) {
    gradeNum = clampGradeForStage(stage, gradeNum);
  } else if (stage && gradeNum == null) {
    const inferred = inferStageGradeFromLegacyString(raw.grade);
    if (inferred && inferred.stage === stage) {
      gradeNum = inferred.grade;
    }
  } else if (!stage || gradeNum == null) {
    const inferred = inferStageGradeFromLegacyString(raw.grade);
    if (inferred) {
      stage = inferred.stage;
      gradeNum = inferred.grade;
    }
  }

  if (stage && gradeNum != null && isValidStageGrade(stage, gradeNum)) {
    const gradeLabel = getGradeLabel(stage, gradeNum);
    return {
      ...raw,
      stage,
      grade: gradeNum,
      level: stage,
      gradeNumber: gradeNum,
      gradeCode: getGradeCode(stage, gradeNum),
      gradeLabel,
    };
  }

  return {
    ...raw,
    stage: null,
    grade: null,
    level: null,
    gradeNumber: null,
    gradeCode: "",
    gradeLabel: "",
  };
}

export type FilterStudentsParams = {
  stage?: Stage | "all";
  grade?: number | "all";
  gradeCode?: string | "all";
  /** When true, only students with `isActive === true`; when false, only false; `all` skips. */
  isActive?: boolean | "all";
};

/**
 * Filter students by stage + grade + optional isActive.
 * Rows missing stage/grade are excluded when a non-all stage or grade filter is applied.
 */
export function filterStudents<T extends Record<string, unknown>>(
  students: T[],
  params: FilterStudentsParams
): T[] {
  return students.filter((s) => {
    const st = (s.stage ?? s.level) as unknown;
    const gr = s.grade ?? s.gradeNumber;

    if (params.stage != null && params.stage !== "all") {
      if (!isStage(st) || st !== params.stage) return false;
    }

    if (params.grade !== undefined && params.grade !== "all") {
      const g = typeof gr === "number" ? gr : Number(gr);
      if (!Number.isFinite(g) || g !== params.grade) return false;
    }

    if (params.gradeCode && params.gradeCode !== "all") {
      if (s.gradeCode !== params.gradeCode) return false;
    }

    if (params.isActive !== undefined && params.isActive !== "all") {
      if (Boolean(s.isActive) !== params.isActive) return false;
    }

    return true;
  });
}

export function studentHasCompleteStageGrade(s: Record<string, unknown>): boolean {
  const st = s.stage ?? s.level;
  const gr = s.grade ?? s.gradeNumber;
  if (!isStage(st)) return false;
  const g = typeof gr === "number" ? gr : Number(gr);
  return Number.isFinite(g) && isValidStageGrade(st, g);
}
