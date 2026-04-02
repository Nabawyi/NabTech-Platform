"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { getGradeLabel, type SchoolLevel } from "@/lib/constants";
import {
  clampGradeForStage,
  isStage,
  normalizeStageGrade,
  normalizeStudentRecord,
  type Stage,
} from "@/lib/education";
import type { AddStudentPayload, StudentRow } from "@/types/domain";
import { validateEgyptianPhone } from "@/lib/validation";
import { loginTeacher } from "@/app/actions/teachers";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "students.json");

const initialData: Record<string, unknown>[] = [];


export async function initDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  }
}

export async function getStudents(teacherId?: string) {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  let effectiveTeacherId = teacherId;
  if (session.role === "admin" || session.role === "student") {
    effectiveTeacherId = session.teacherId;
  }

  await initDb();
  const data = fs.readFileSync(dataFile, "utf-8");
  const list = JSON.parse(data) as Record<string, unknown>[];
  const normalized = list.map((r) => normalizeStudentRecord(r));
  
  if (effectiveTeacherId) {
    return normalized.filter(s => s.teacherId === effectiveTeacherId);
  }
  return normalized;
}

export async function addStudent(studentData: AddStudentPayload) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && studentData.teacherId !== session.teacherId) throw new Error("Unauthorized");

  await initDb();
  const rawList = JSON.parse(fs.readFileSync(dataFile, "utf-8")) as Record<string, unknown>[];
  const students = rawList.map((r) => normalizeStudentRecord(r));

  // Validate student phone (Egyptian format)
  const phoneValidation = validateEgyptianPhone(String(studentData.phone ?? ""), "رقم الطالب");
  if (!phoneValidation.valid) {
    throw new Error(phoneValidation.error ?? "رقم الهاتف غير صالح");
  }

  // Validate parent phone (Required)
  const parentPhoneValidation = validateEgyptianPhone(String(studentData.parentPhone ?? ""), "رقم ولي الأمر");
  if (!parentPhoneValidation.valid) {
    throw new Error(parentPhoneValidation.error ?? "رقم ولي الأمر مطلوب");
  }

  if (students.find((s) => s.phone === studentData.phone)) {
    throw new Error("رقم الهاتف مسجل مسبقاً");
  }

  const stageInput = (studentData.stage ?? studentData.level) as unknown;
  const gradeInput = studentData.grade ?? studentData.gradeNumber;
  const parsed = normalizeStageGrade(stageInput, gradeInput);
  if (!parsed) {
    throw new Error("المرحلة والصف غير صالحين: يجب اختيار مرحلة وصف ضمن النطاق الصحيح");
  }
  const { stage, grade } = parsed;
  const gradeLabel = getGradeLabel(stage, grade);

  // New ID Scheme: Level(1,2,3) + Grade index within stage + Serial (3 digits)
  const levelMap: Record<string, number> = { primary: 1, preparatory: 2, secondary: 3 };
  const L = levelMap[stage] ?? 3;
  const G = clampGradeForStage(stage, grade);
  const prefix = L * 10 + G;

  const sameGradeStudents = students.filter((s) => Math.floor(Number(s.id) / 1000) === prefix);
  const nextNumber =
    sameGradeStudents.length > 0
      ? Math.max(...sameGradeStudents.map((s) => Number(s.id) % 1000)) + 1
      : 1;
  const newId = prefix * 1000 + nextNumber;

  const newStudent = {
    id: newId,
    teacherId: studentData.teacherId,
    name: String(studentData.name ?? ""),
    phone: String(studentData.phone ?? ""),
    parentPhone: String(studentData.parentPhone ?? ""),
    stage,
    grade,
    level: stage,
    gradeNumber: grade,
    /** @deprecated legacy display string; prefer grade (number) + stage */
    gradeDisplay: gradeLabel,
    city: String(studentData.city ?? "غير محدد") || "غير محدد",
    locationId: String(studentData.locationId ?? ""),
    groupId: String(studentData.groupId ?? ""),
    password: String(studentData.password ?? ""),
    status: "pending",
    timestamp: new Date().toISOString(),
  };

  const persisted = [newStudent, ...rawList];
  fs.writeFileSync(dataFile, JSON.stringify(persisted, null, 2));
  return normalizeStudentRecord(newStudent as Record<string, unknown>);
}


/**
 * Update student status directly on raw JSON (not on normalized copies).
 * This fixes the bug where writing normalized copies back lost the status change.
 */
export async function updateStudentStatus(id: number, status: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  await initDb();
  const rawList = JSON.parse(fs.readFileSync(dataFile, "utf-8")) as Record<string, unknown>[];
  const index = rawList.findIndex((s) => Number(s.id) === id);
  if (index > -1) {
    if (session.role === "admin" && rawList[index].teacherId !== session.teacherId) throw new Error("Unauthorized");
    rawList[index].status = status;
    fs.writeFileSync(dataFile, JSON.stringify(rawList, null, 2));
    return true;
  }
  return false;
}

/**
 * Approve a student: sets status to "active" so they can log in immediately.
 */
export async function approveStudent(id: number) {
  return updateStudentStatus(id, "active");
}

/**
 * Reject a student: sets status to "rejected".
 */
export async function rejectStudent(id: number) {
  return updateStudentStatus(id, "rejected");
}


export async function loginUser(phone: string, pass: string) {
  // ─── Owner Login ──────────────────────────────────────────
  if (phone === "owner" && pass === "owner123") {
    const cookieStore = await cookies();
    cookieStore.set("user_session", JSON.stringify({ 
      role: "owner", 
      name: "مالك المنصة" 
    }), { 
      path: "/", 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7
    });
    return { success: true, role: "owner" };
  }

  // ─── Teacher Login (via email) ────────────────────────────
  // Check if the input looks like an email (contains @)
  if (phone.includes("@")) {
    const result = await loginTeacher(phone, pass);
    if (result.success) return { success: true, role: "admin" };
    if (result.error) return { error: result.error };
  }

  // ─── Legacy Hardcoded Admin Check ─────────────────────────
  if (phone === "admin" && pass === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("user_session", JSON.stringify({ 
      role: "admin", 
      teacherId: "teacher_1",
      name: "أ. علاء شتا" 
    }), { 
      path: "/", 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7
    });
    return { success: true, role: "admin" };
  }
  
  await initDb();
  const students = await getStudents();
  const student = students.find((s) => s.phone === phone && s.password === pass);
  
  if (!student) return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" };
  if (student.status === "pending") return { error: "حسابك لا يزال قيد المراجعة ولم يتم تفعيله بعد" };
  if (student.status === "rejected") return { error: "تم إيقاف حسابك، يرجى مراجعة الإدارة" };

  const st = (student.stage ?? student.level) as Stage | null;
  const gr = (student.grade ?? student.gradeNumber) as number | null;
  const sessionStage: SchoolLevel =
    st && isStage(st) ? st : "secondary";
  const sessionGrade =
    typeof gr === "number" && Number.isFinite(gr) ? gr : 1;
  
  const cookieStore = await cookies();
  const displayGrade =
    typeof student.gradeLabel === "string" && student.gradeLabel
      ? student.gradeLabel
      : getGradeLabel(sessionStage, sessionGrade);

  cookieStore.set("user_session", JSON.stringify({ 
    role: "student", 
    id: student.id, 
    teacherId: student.teacherId,
    name: student.name, 
    stage: sessionStage,
    level: sessionStage,
    gradeNumber: sessionGrade,
    grade: displayGrade,
  }), { 
    path: "/", 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return { success: true, role: "student" };
}


export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
}

export async function updateStudentGroup(id: number, locationId: string, groupId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  await initDb();
  const rawList = JSON.parse(fs.readFileSync(dataFile, "utf-8")) as Record<string, unknown>[];
  const index = rawList.findIndex((s) => Number(s.id) === id);
  if (index > -1) {
    if (session.role === "admin" && rawList[index].teacherId !== session.teacherId) throw new Error("Unauthorized");
    rawList[index].locationId = locationId;
    rawList[index].groupId = groupId;
    fs.writeFileSync(dataFile, JSON.stringify(rawList, null, 2));
    return { success: true };
  }
  return { success: false };
}

export async function getUserSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");
  if (!session) return null;
  return JSON.parse(session.value);
}

/**
 * Permanently delete a student and all related data (attendance, subscriptions).
 */
export async function deleteStudent(id: number): Promise<{ success: boolean; error?: string }> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) return { success: false, error: "Unauthorized" };

  await initDb();

  // 1. Remove student from students.json
  const rawList = JSON.parse(fs.readFileSync(dataFile, "utf-8")) as Record<string, unknown>[];
  const index = rawList.findIndex((s) => Number(s.id) === id);
  if (index === -1) {
    return { success: false, error: "الطالب غير موجود" };
  }

  if (session.role === "admin" && rawList[index].teacherId !== session.teacherId) {
    return { success: false, error: "Unauthorized" };
  }
  rawList.splice(index, 1);
  fs.writeFileSync(dataFile, JSON.stringify(rawList, null, 2));

  // 2. Remove attendance records for this student
  const attendanceFile = path.join(dataDir, "attendance.json");
  if (fs.existsSync(attendanceFile)) {
    try {
      const attendanceData = JSON.parse(fs.readFileSync(attendanceFile, "utf-8")) as Record<string, unknown>[];
      const filtered = attendanceData.filter((r) => Number(r.studentId) !== id);
      fs.writeFileSync(attendanceFile, JSON.stringify(filtered, null, 2));
    } catch { /* ignore parse errors */ }
  }

  // 3. Remove subscription records for this student
  const subsFile = path.join(dataDir, "subscriptions.json");
  if (fs.existsSync(subsFile)) {
    try {
      const subsData = JSON.parse(fs.readFileSync(subsFile, "utf-8")) as Record<string, unknown>[];
      const filtered = subsData.filter((r) => Number(r.studentId) !== id);
      fs.writeFileSync(subsFile, JSON.stringify(filtered, null, 2));
    } catch { /* ignore parse errors */ }
  }

  // 4. Remove quiz results for this student (if file exists)
  const quizResultsFile = path.join(dataDir, "quiz_results.json");
  if (fs.existsSync(quizResultsFile)) {
    try {
      const quizData = JSON.parse(fs.readFileSync(quizResultsFile, "utf-8")) as Record<string, unknown>[];
      const filtered = quizData.filter((r) => Number(r.studentId) !== id);
      fs.writeFileSync(quizResultsFile, JSON.stringify(filtered, null, 2));
    } catch { /* ignore parse errors */ }
  }

  return { success: true };
}

/**
 * Delete ALL students and their related data (attendance, subscriptions, quiz results).
 * Used for a clean-slate reset scoped to a specific teacher, or all if no teacherId.
 */
export async function deleteAllStudents(teacherId?: string): Promise<{ success: boolean; deletedCount: number }> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  let targetTeacherId = teacherId;
  if (session.role === "admin") targetTeacherId = session.teacherId;

  await initDb();
  const rawList = JSON.parse(fs.readFileSync(dataFile, "utf-8")) as Record<string, unknown>[];

  let toDelete: Record<string, unknown>[];
  let toKeep: Record<string, unknown>[];

  if (targetTeacherId) {
    toDelete = rawList.filter((s) => String(s.teacherId) === targetTeacherId);
    toKeep = rawList.filter((s) => String(s.teacherId) !== targetTeacherId);
  } else {
    toDelete = rawList;
    toKeep = [];
  }

  const deletedIds = new Set(toDelete.map((s) => Number(s.id)));
  const deletedCount = toDelete.length;

  // 1. Write remaining students
  fs.writeFileSync(dataFile, JSON.stringify(toKeep, null, 2));

  // 2. Clean attendance
  const attendanceFile = path.join(dataDir, "attendance.json");
  if (fs.existsSync(attendanceFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(attendanceFile, "utf-8")) as Record<string, unknown>[];
      const filtered = data.filter((r) => !deletedIds.has(Number(r.studentId)));
      fs.writeFileSync(attendanceFile, JSON.stringify(filtered, null, 2));
    } catch { /* ignore */ }
  }

  // 3. Clean subscriptions
  const subsFile = path.join(dataDir, "subscriptions.json");
  if (fs.existsSync(subsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(subsFile, "utf-8")) as Record<string, unknown>[];
      const filtered = data.filter((r) => !deletedIds.has(Number(r.studentId)));
      fs.writeFileSync(subsFile, JSON.stringify(filtered, null, 2));
    } catch { /* ignore */ }
  }

  // 4. Clean quiz results
  const quizFile = path.join(dataDir, "quiz_results.json");
  if (fs.existsSync(quizFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(quizFile, "utf-8")) as Record<string, unknown>[];
      const filtered = data.filter((r) => !deletedIds.has(Number(r.studentId)));
      fs.writeFileSync(quizFile, JSON.stringify(filtered, null, 2));
    } catch { /* ignore */ }
  }

  return { success: true, deletedCount };
}

export { validateEgyptianPhone };

