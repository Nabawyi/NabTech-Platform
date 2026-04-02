"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { type Stage } from "@/lib/education";
import { getTeacherByInviteCode as getTeacherByInviteCodeFromDB } from "@/app/actions/teachers";

export type TeacherSettings = {
  id: string;
  name: string;
  inviteCode: string;
  dark_mode: boolean;
  enabled_levels: Stage[];
  enabled_grades: number[];
};

const defaultSettings: TeacherSettings = {
  id: "teacher_1",
  name: "المعلم",
  inviteCode: "GENIUS101",
  dark_mode: false,
  enabled_levels: ["primary", "preparatory", "secondary"],
  enabled_grades: [1, 2, 3, 4, 5, 6],
};

const dataDir = path.join(process.cwd(), "data");

// ─── Per-teacher settings file path ──────────────────────────────────────────

function getSettingsFilePath(teacherId: string): string {
  // Legacy teacher_1 uses the original file
  if (teacherId === "teacher_1") {
    return path.join(dataDir, "teacher_settings.json");
  }
  return path.join(dataDir, `teacher_settings_${teacherId}.json`);
}

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "BIO-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─── Get current teacher ID from session cookie ──────────────────────────────

async function getSessionTeacherId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");
    if (session) {
      const data = JSON.parse(session.value);
      if (data.teacherId) return data.teacherId;
    }
  } catch {}
  return "teacher_1"; // Fallback to legacy
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/**
 * Get settings for a specific teacher by ID.
 * If no teacherId is provided, reads from the session cookie.
 */
export async function getTeacherSettings(teacherId?: string): Promise<TeacherSettings> {
  const id = teacherId || (await getSessionTeacherId());
  const settingsFile = getSettingsFilePath(id);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(settingsFile)) {
    // Create default settings for this teacher
    const newSettings = { ...defaultSettings, id, inviteCode: generateInviteCode() };
    fs.writeFileSync(settingsFile, JSON.stringify(newSettings, null, 2));
    return newSettings;
  }

  try {
    const data = fs.readFileSync(settingsFile, "utf-8");
    const parsed = JSON.parse(data);

    // Ensure vital fields exist
    if (!parsed.inviteCode) {
      parsed.inviteCode = generateInviteCode();
      fs.writeFileSync(settingsFile, JSON.stringify(parsed, null, 2));
    }
    if (!parsed.id) parsed.id = id;
    if (!parsed.name) parsed.name = "مدرس";

    return { ...defaultSettings, ...parsed, id };
  } catch (err) {
    console.error("Failed to parse settings for", id, err);
    return { ...defaultSettings, id };
  }
}

export async function getTeacherByInviteCode(code: string): Promise<TeacherSettings | null> {
  // 1. Check legacy teacher_settings.json (BIO-XXXX codes)
  const legacyFile = path.join(dataDir, "teacher_settings.json");
  if (fs.existsSync(legacyFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(legacyFile, "utf-8"));
      if (data.inviteCode && data.inviteCode.toUpperCase() === code.toUpperCase()) {
        return { ...defaultSettings, ...data };
      }
    } catch {}
  }

  // 2. Check new teachers.json (NAB codes)
  const teacher = await getTeacherByInviteCodeFromDB(code);
  if (teacher && teacher.status === "active" && teacher.invite_code) {
    // Load per-teacher settings
    const perTeacherFile = getSettingsFilePath(teacher.id);
    if (fs.existsSync(perTeacherFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(perTeacherFile, "utf-8"));
        return { ...defaultSettings, ...data, id: teacher.id, name: teacher.name, inviteCode: teacher.invite_code };
      } catch {}
    }
    // Return defaults with teacher info
    return {
      ...defaultSettings,
      id: teacher.id,
      name: teacher.name,
      inviteCode: teacher.invite_code,
    };
  }

  return null;
}

/**
 * Update settings for the currently logged-in teacher (from session).
 */
export async function updateTeacherSettings(newSettings: Partial<TeacherSettings>): Promise<TeacherSettings> {
  const teacherId = await getSessionTeacherId();
  const current = await getTeacherSettings(teacherId);
  const updated = { ...current, ...newSettings };
  // Never allow manual update of id or inviteCode via normal update
  updated.id = current.id;
  updated.inviteCode = current.inviteCode;

  const settingsFile = getSettingsFilePath(teacherId);
  fs.writeFileSync(settingsFile, JSON.stringify(updated, null, 2));
  return updated;
}

/**
 * Delete teacher settings file (used when deleting a teacher).
 */
export async function deleteTeacherSettingsFile(teacherId: string): Promise<void> {
  const settingsFile = getSettingsFilePath(teacherId);
  if (fs.existsSync(settingsFile)) {
    fs.unlinkSync(settingsFile);
  }
}
