"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { type Stage } from "@/lib/education";
import { getUserSession } from "./students";
import { getTeacherByInviteCode as getTeacherByInviteCodeFromDB } from "@/app/actions/teachers";

export type TeacherSettings = {
  id: string;
  name: string;
  inviteCode: string;
  dark_mode: boolean;
  enabled_levels: Stage[];
  enabled_grades: number[];
  enabled_grade_codes: string[];
};

const defaultSettings: Omit<TeacherSettings, "id" | "name" | "inviteCode"> = {
  dark_mode: false,
  enabled_levels: ["primary", "preparatory", "secondary"],
  enabled_grades: [1, 2, 3, 4, 5, 6],
  enabled_grade_codes: [
    "pri_1", "pri_2", "pri_3", "pri_4", "pri_5", "pri_6",
    "pre_1", "pre_2", "pre_3",
    "sec_1", "sec_2", "sec_3"
  ],
};

// ─── Get settings for current teacher ────────────────────────────────────────

export async function getTeacherSettings(teacherId?: string): Promise<TeacherSettings> {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore(); // Disable all Next.js caching for this request to ensure fresh data always

  const session = await getUserSession();
  const id = teacherId ?? session?.teacherId ?? "";
  if (!id) return { ...defaultSettings, id: "", name: "مدرس", inviteCode: "" };

  const admin = createAdminClient();

  // Get settings row
  const { data: settingsRow } = await admin
    .from("teacher_settings")
    .select("*")
    .eq("teacher_id", id)
    .maybeSingle();

  // Get profile + teacher info
  const { data: profile } = await admin
    .from("profiles")
    .select("name")
    .eq("id", id)
    .single();

  const { data: teacher } = await admin
    .from("teachers")
    .select("invite_code")
    .eq("id", id)
    .single();

  return {
    id,
    name: profile?.name ?? "مدرس",
    inviteCode: teacher?.invite_code ?? "",
    dark_mode: settingsRow?.dark_mode ?? defaultSettings.dark_mode,
    enabled_levels: settingsRow?.enabled_levels ?? defaultSettings.enabled_levels,
    enabled_grades: settingsRow?.enabled_grades ?? defaultSettings.enabled_grades,
    enabled_grade_codes: settingsRow?.enabled_grade_codes ?? defaultSettings.enabled_grade_codes,
  };
}

export async function getTeacherByInviteCode(code: string): Promise<TeacherSettings | null> {
  const teacher = await getTeacherByInviteCodeFromDB(code);
  if (!teacher || teacher.status !== "active" || !teacher.invite_code) return null;
  return getTeacherSettings(teacher.id);
}

// ─── Update settings ──────────────────────────────────────────────────────────

export async function updateTeacherSettings(newSettings: Partial<TeacherSettings>): Promise<TeacherSettings> {
  const session = await getUserSession();
  const teacherId = session?.teacherId;
  if (!teacherId) throw new Error("Unauthorized");

  console.log("[updateTeacherSettings] Triggered for teacher:", teacherId);

  const admin = createAdminClient();
  
  // 1. Fetch current settings to perform a clean merge
  const { data: current } = await admin
    .from("teacher_settings")
    .select("*")
    .eq("teacher_id", teacherId)
    .maybeSingle();

  // 2. Prepare payload for UPSERT
  const payload = {
    teacher_id: teacherId,
    dark_mode: newSettings.dark_mode ?? current?.dark_mode ?? defaultSettings.dark_mode,
    enabled_levels: newSettings.enabled_levels ?? current?.enabled_levels ?? defaultSettings.enabled_levels,
    enabled_grades: newSettings.enabled_grades ?? current?.enabled_grades ?? defaultSettings.enabled_grades,
    enabled_grade_codes: newSettings.enabled_grade_codes ?? current?.enabled_grade_codes ?? defaultSettings.enabled_grade_codes,
    updated_at: new Date().toISOString(),
  };

  console.log("[updateTeacherSettings] Payload prepared:", payload);

  // 3. Perform UPSERT with conflict on teacher_id
  const response = await admin
    .from("teacher_settings")
    .upsert(payload, { onConflict: "teacher_id" })
    .select();

  console.log("[updateTeacherSettings] Supabase Raw Response:", response);

  if (response.error) {
    console.error("[updateTeacherSettings] Error saving to Supabase:", response.error);
    throw new Error(`Failed to save settings: ${response.error.message}`);
  }

  // 4. Force cache invalidation
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/teacher");
  revalidatePath("/teacher/settings");

  console.log("[updateTeacherSettings] Revalidation triggered for /teacher");

  return getTeacherSettings(teacherId);
}

export async function deleteTeacherSettingsFile(teacherId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("teacher_settings").delete().eq("teacher_id", teacherId);
}
