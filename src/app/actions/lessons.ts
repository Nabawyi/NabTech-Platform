"use server";

import fs from "fs";
import path from "path";
import { SchoolLevel, getGradeLabel } from "@/lib/constants";
import { normalizeStageGrade } from "@/lib/education";
import { getUserSession } from "./students";

const dataDir = path.join(process.cwd(), "data");
const lessonsFile = path.join(dataDir, "lessons.json");

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
  grade?: string; // Optional for backward compatibility
  videoUrl: string;
  description: string;
  pdfUrl?: string;
  questions: QuizQuestion[];
  createdAt: string;
};

function readLessons(): Lesson[] {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(lessonsFile)) fs.writeFileSync(lessonsFile, "[]");
  return JSON.parse(fs.readFileSync(lessonsFile, "utf-8"));
}

function writeLessons(lessons: Lesson[]) {
  fs.writeFileSync(lessonsFile, JSON.stringify(lessons, null, 2));
}

export async function getLessons(teacherId?: string): Promise<Lesson[]> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  let effectiveTeacherId = teacherId;
  if (session.role === "student" || session.role === "admin") {
    effectiveTeacherId = session.teacherId;
  }
  
  const lessons = readLessons();
  return effectiveTeacherId ? lessons.filter((l) => l.teacherId === effectiveTeacherId) : lessons;
}

export async function getLessonsByLevelAndGrade(level: SchoolLevel, gradeNumber: number, teacherId?: string): Promise<Lesson[]> {
  const lessons = await getLessons(teacherId);
  return lessons.filter((l) => l.level === level && l.gradeNumber === gradeNumber);
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");

  const lessons = readLessons();
  const lesson = lessons.find((l) => l.id === id) ?? null;
  if (lesson && (session.role === "student" || session.role === "admin") && lesson.teacherId !== session.teacherId) {
    return null;
  }
  return lesson;
}

export async function addLesson(lessonData: Omit<Lesson, "id" | "createdAt">): Promise<Lesson> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && lessonData.teacherId !== session.teacherId) throw new Error("Unauthorized");

  const valid = normalizeStageGrade(lessonData.level, lessonData.gradeNumber);
  if (!valid) {
    throw new Error("يجب اختيار مرحلة وصف دراسي صالحين للدرس");
  }
  const lessons = readLessons();
  const newLesson: Lesson = {
    ...lessonData,
    level: valid.stage,
    gradeNumber: valid.grade,
    grade: lessonData.grade?.trim() || getGradeLabel(valid.stage, valid.grade),
    id: "lesson_" + Date.now(),
    createdAt: new Date().toISOString(),
  };
  lessons.push(newLesson);
  writeLessons(lessons);
  return newLesson;
}

export async function updateLesson(id: string, data: Partial<Omit<Lesson, "id" | "createdAt">>): Promise<boolean> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const lessons = readLessons();
  const idx = lessons.findIndex((l) => l.id === id);
  if (idx === -1) return false;

  if (session.role === "admin" && lessons[idx].teacherId !== session.teacherId) throw new Error("Unauthorized");

  const merged = { ...lessons[idx], ...data };
  const valid = normalizeStageGrade(merged.level, merged.gradeNumber);
  if (!valid) return false;
  lessons[idx] = {
    ...merged,
    level: valid.stage,
    gradeNumber: valid.grade,
    grade: merged.grade?.trim() || getGradeLabel(valid.stage, valid.grade),
  };
  writeLessons(lessons);
  return true;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const lessons = readLessons();
  const lesson = lessons.find(l => l.id === id);
  if (!lesson) return false;
  
  if (session.role === "admin" && lesson.teacherId !== session.teacherId) throw new Error("Unauthorized");

  const filtered = lessons.filter((l) => l.id !== id);
  if (filtered.length === lessons.length) return false;
  writeLessons(filtered);
  return true;
}
