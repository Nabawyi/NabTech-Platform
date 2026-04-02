"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { validateEgyptianPhone } from "@/lib/validation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TeacherRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: "active" | "pending" | "rejected" | "inactive";
  invite_code: string | null;
  created_at: string;
  approved_at: string | null;
};

export type RegisterTeacherPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

// ─── File I/O ────────────────────────────────────────────────────────────────

const dataDir = path.join(process.cwd(), "data");
const teachersFile = path.join(dataDir, "teachers.json");

function readTeachers(): TeacherRecord[] {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(teachersFile)) {
    fs.writeFileSync(teachersFile, "[]");
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(teachersFile, "utf-8"));
  } catch {
    return [];
  }
}

function writeTeachers(data: TeacherRecord[]) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(teachersFile, JSON.stringify(data, null, 2));
}

// ─── Invite Code Generation ─────────────────────────────────────────────────

async function generateUniqueInviteCode(): Promise<string> {
  const teachers = readTeachers();
  const existingCodes = new Set(
    teachers.map((t) => t.invite_code).filter(Boolean)
  );

  let code: string;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  do {
    if (attempts < MAX_ATTEMPTS) {
      const num = Math.floor(Math.random() * 900) + 100;
      code = `NAB${num}`;
    } else {
      const bigNum = Math.floor(Math.random() * 90000) + 10000;
      code = `NAB${bigNum}`;
    }
    attempts++;
  } while (existingCodes.has(code));

  return code;
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

export async function getTeachers(): Promise<TeacherRecord[]> {
  return readTeachers();
}

export async function getPendingTeachers(): Promise<TeacherRecord[]> {
  return readTeachers().filter((t) => t.status === "pending");
}

export async function getTeacherById(id: string): Promise<TeacherRecord | null> {
  return readTeachers().find((t) => t.id === id) ?? null;
}

export async function getTeacherByInviteCode(code: string): Promise<TeacherRecord | null> {
  return (
    readTeachers().find(
      (t) =>
        t.invite_code &&
        t.invite_code.toUpperCase() === code.toUpperCase() &&
        t.status === "active"
    ) ?? null
  );
}

// ─── Registration ────────────────────────────────────────────────────────────

export async function registerTeacher(
  payload: RegisterTeacherPayload
): Promise<{ success: boolean; error?: string }> {
  const { name, email, phone, password } = payload;

  if (!name.trim()) return { success: false, error: "الاسم مطلوب" };
  if (!email.trim()) return { success: false, error: "البريد الإلكتروني مطلوب" };
  if (!password.trim()) return { success: false, error: "كلمة المرور مطلوبة" };

  const phoneCheck = validateEgyptianPhone(phone, "رقم الهاتف");
  if (!phoneCheck.valid) {
    return { success: false, error: phoneCheck.error ?? "رقم الهاتف غير صالح" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { success: false, error: "صيغة البريد الإلكتروني غير صحيحة" };
  }

  const teachers = readTeachers();

  if (teachers.find((t) => t.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
  }

  if (teachers.find((t) => t.phone === phone.trim())) {
    return { success: false, error: "رقم الهاتف مسجل مسبقاً" };
  }

  const newId = `teacher_${Date.now()}`;

  const newTeacher: TeacherRecord = {
    id: newId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password: password,
    status: "pending",
    invite_code: null,
    created_at: new Date().toISOString(),
    approved_at: null,
  };

  teachers.push(newTeacher);
  writeTeachers(teachers);

  return { success: true };
}

// ─── Approval Flow ───────────────────────────────────────────────────────────

export async function approveTeacher(
  id: string
): Promise<{ success: boolean; invite_code?: string; error?: string }> {
  const teachers = readTeachers();
  const index = teachers.findIndex((t) => t.id === id);

  if (index === -1) return { success: false, error: "المعلم غير موجود" };
  if (teachers[index].status === "active") {
    return {
      success: true,
      invite_code: teachers[index].invite_code ?? undefined,
    };
  }

  // Generate new invite code only if teacher doesn't have one
  const invite_code = teachers[index].invite_code || (await generateUniqueInviteCode());

  teachers[index].status = "active";
  teachers[index].invite_code = invite_code;
  teachers[index].approved_at = new Date().toISOString();

  writeTeachers(teachers);

  // Create per-teacher settings file if needed
  const perTeacherSettings = path.join(dataDir, `teacher_settings_${id}.json`);
  if (!fs.existsSync(perTeacherSettings)) {
    const defaultSettings = {
      id: id,
      name: teachers[index].name,
      inviteCode: invite_code,
      dark_mode: false,
      enabled_levels: ["primary", "preparatory", "secondary"],
      enabled_grades: [1, 2, 3, 4, 5, 6],
    };
    fs.writeFileSync(perTeacherSettings, JSON.stringify(defaultSettings, null, 2));
  }

  return { success: true, invite_code };
}

export async function rejectTeacher(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const teachers = readTeachers();
  const index = teachers.findIndex((t) => t.id === id);

  if (index === -1) return { success: false, error: "المعلم غير موجود" };

  teachers[index].status = "rejected";
  writeTeachers(teachers);

  return { success: true };
}

// ─── Deactivate Teacher ──────────────────────────────────────────────────────

/**
 * Deactivate a teacher: sets status = "inactive".
 * Teacher cannot login. If already logged in, session will fail on next request.
 */
export async function deactivateTeacher(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const teachers = readTeachers();
  const index = teachers.findIndex((t) => t.id === id);

  if (index === -1) return { success: false, error: "المعلم غير موجود" };

  teachers[index].status = "inactive";
  writeTeachers(teachers);

  return { success: true };
}

// ─── Delete Teacher (with cascade) ───────────────────────────────────────────

/**
 * Permanently delete a teacher and ALL their related data:
 * - students
 * - attendance records
 * - subscriptions
 * - lessons
 * - quiz results
 * - teacher settings file
 * - locations/groups
 */
export async function deleteTeacher(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const teachers = readTeachers();
  const index = teachers.findIndex((t) => t.id === id);

  if (index === -1) return { success: false, error: "المعلم غير موجود" };

  // Remove from teachers list
  teachers.splice(index, 1);
  writeTeachers(teachers);

  // ── Cascade delete all related data ──

  // 1. Delete students belonging to this teacher
  const studentsFile = path.join(dataDir, "students.json");
  if (fs.existsSync(studentsFile)) {
    try {
      const students = JSON.parse(fs.readFileSync(studentsFile, "utf-8")) as Record<string, unknown>[];
      const deletedStudentIds = new Set(
        students.filter((s) => String(s.teacherId) === id).map((s) => Number(s.id))
      );
      const remaining = students.filter((s) => String(s.teacherId) !== id);
      fs.writeFileSync(studentsFile, JSON.stringify(remaining, null, 2));

      // 2. Delete attendance records for those students
      const attendanceFile = path.join(dataDir, "attendance.json");
      if (fs.existsSync(attendanceFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(attendanceFile, "utf-8")) as Record<string, unknown>[];
          const filtered = data.filter(
            (r) => String(r.teacherId) !== id && !deletedStudentIds.has(Number(r.studentId))
          );
          fs.writeFileSync(attendanceFile, JSON.stringify(filtered, null, 2));
        } catch {}
      }

      // 3. Delete subscriptions for those students
      const subsFile = path.join(dataDir, "subscriptions.json");
      if (fs.existsSync(subsFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(subsFile, "utf-8")) as Record<string, unknown>[];
          const filtered = data.filter((r) => !deletedStudentIds.has(Number(r.studentId)));
          fs.writeFileSync(subsFile, JSON.stringify(filtered, null, 2));
        } catch {}
      }

      // 4. Delete quiz results for those students
      const quizFile = path.join(dataDir, "quiz_results.json");
      if (fs.existsSync(quizFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(quizFile, "utf-8")) as Record<string, unknown>[];
          const filtered = data.filter((r) => !deletedStudentIds.has(Number(r.studentId)));
          fs.writeFileSync(quizFile, JSON.stringify(filtered, null, 2));
        } catch {}
      }
    } catch {}
  }

  // 5. Delete lessons for this teacher
  const lessonsFile = path.join(dataDir, "lessons.json");
  if (fs.existsSync(lessonsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(lessonsFile, "utf-8")) as Record<string, unknown>[];
      const filtered = data.filter((r) => String(r.teacherId) !== id);
      fs.writeFileSync(lessonsFile, JSON.stringify(filtered, null, 2));
    } catch {}
  }

  // 6. Delete locations/groups for this teacher
  const locationsFile = path.join(dataDir, "locations.json");
  if (fs.existsSync(locationsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(locationsFile, "utf-8")) as Record<string, unknown>[];
      const filtered = data.filter((r) => String(r.teacherId) !== id);
      fs.writeFileSync(locationsFile, JSON.stringify(filtered, null, 2));
    } catch {}
  }

  // 7. Delete teacher settings file
  const settingsFile = path.join(dataDir, `teacher_settings_${id}.json`);
  if (fs.existsSync(settingsFile)) {
    fs.unlinkSync(settingsFile);
  }

  return { success: true };
}

// ─── Teacher Login ───────────────────────────────────────────────────────────

export async function loginTeacher(
  email: string,
  password: string
): Promise<{ success?: boolean; error?: string; role?: string }> {
  const teachers = readTeachers();
  const teacher = teachers.find(
    (t) =>
      t.email.toLowerCase() === email.trim().toLowerCase() &&
      t.password === password
  );

  if (!teacher) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  if (teacher.status === "pending") {
    return { error: "حسابك قيد المراجعة. سيتم إشعارك عند الموافقة." };
  }

  if (teacher.status === "rejected") {
    return { error: "تم رفض طلبك. يرجى التواصل مع الإدارة." };
  }

  if (teacher.status === "inactive") {
    return { error: "تم إيقاف حسابك. يرجى التواصل مع الإدارة." };
  }

  // status === "active" → allow login
  const cookieStore = await cookies();
  cookieStore.set(
    "user_session",
    JSON.stringify({
      role: "admin",
      teacherId: teacher.id,
      name: teacher.name,
      email: teacher.email,
    }),
    {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  return { success: true, role: "admin" };
}
