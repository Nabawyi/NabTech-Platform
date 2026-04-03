"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateEgyptianPhone } from "@/lib/validation";

export type TeacherRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
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

// ─── Generate unique invite code ─────────────────────────────────────────────

async function generateUniqueInviteCode(): Promise<string> {
  const supabase = await createClient();
  const { data: teachers } = await supabase.from("teachers").select("invite_code");
  const existingCodes = new Set((teachers ?? []).map((t: any) => t.invite_code).filter(Boolean));
  let code: string;
  let attempts = 0;
  do {
    const num = attempts < 100 ? Math.floor(Math.random() * 900) + 100 : Math.floor(Math.random() * 90000) + 10000;
    code = `NAB${num}`;
    attempts++;
  } while (existingCodes.has(code));
  return code;
}

// ─── Get all teachers (owner only) ───────────────────────────────────────────

export async function getTeachers(): Promise<TeacherRecord[]> {
  const admin = createAdminClient();

  // Fetch teacher rows (service_role bypasses RLS)
  const { data, error } = await admin
    .from("teachers")
    .select("*, profiles(name, email, phone)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  // Fetch auth users to get emails as a reliable fallback
  // (in case profiles.email column doesn't exist yet)
  let authEmailMap: Record<string, string> = {};
  try {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (users) {
      authEmailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? ""]));
    }
  } catch {
    // Non-fatal: we'll fall back to profiles.email
  }

  return data.map((t: any) => ({
    id: t.id,
    name: t.profiles?.name ?? "",
    email: t.profiles?.email ?? authEmailMap[t.id] ?? "",
    phone: t.profiles?.phone ?? "",
    status: t.status,
    invite_code: t.invite_code,
    created_at: t.created_at,
    approved_at: t.approved_at,
  }));
}

export async function getPendingTeachers(): Promise<TeacherRecord[]> {
  const all = await getTeachers();
  return all.filter((t) => t.status === "pending");
}

export async function getTeacherById(id: string): Promise<TeacherRecord | null> {
  const all = await getTeachers();
  return all.find((t) => t.id === id) ?? null;
}

export async function getTeacherByInviteCode(code: string): Promise<TeacherRecord | null> {
  const normalizedCode = (code || "").trim().toUpperCase();
  if (!normalizedCode) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*, profiles(name, email, phone)")
    .eq("invite_code", normalizedCode)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: (data as any).profiles?.name ?? "",
    email: (data as any).profiles?.email ?? "",
    phone: (data as any).profiles?.phone ?? "",
    status: data.status,
    invite_code: data.invite_code,
    created_at: data.created_at,
    approved_at: data.approved_at,
  };
}

// ─── Register (teacher self-registers, status=pending) ───────────────────────

export async function registerTeacher(
  payload: RegisterTeacherPayload
): Promise<{ success: boolean; error?: string }> {
  const { name, email, phone, password } = payload;

  if (!name.trim()) return { success: false, error: "الاسم مطلوب" };
  if (!email.trim()) return { success: false, error: "البريد الإلكتروني مطلوب" };
  if (!password.trim()) return { success: false, error: "كلمة المرور مطلوبة" };

  const phoneCheck = validateEgyptianPhone(phone, "رقم الهاتف");
  if (!phoneCheck.valid) return { success: false, error: phoneCheck.error ?? "رقم الهاتف غير صالح" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return { success: false, error: "صيغة البريد الإلكتروني غير صحيحة" };

  const admin = createAdminClient();

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });
  if (authError) {
    if (authError.message.includes("already")) return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
    return { success: false, error: authError.message };
  }

  const userId = authData.user.id;

  // Insert profile — try with email first, fall back without if column missing
  let profileError: any = null;
  const profileWithEmail = await admin.from("profiles").insert({
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "teacher",
    phone: phone.trim(),
  });
  profileError = profileWithEmail.error;

  if (profileError && profileError.message?.includes("email")) {
    // Column likely doesn't exist yet — insert without it
    const profileWithoutEmail = await admin.from("profiles").insert({
      id: userId,
      name: name.trim(),
      role: "teacher",
      phone: phone.trim(),
    });
    profileError = profileWithoutEmail.error;
  }

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message };
  }

  // Insert teacher row (pending)
  const { error: teacherError } = await admin.from("teachers").insert({
    id: userId,
    status: "pending",
    invite_code: null,
  });
  if (teacherError) {
    await admin.auth.admin.deleteUser(userId);
    return { success: false, error: teacherError.message };
  }

  return { success: true };
}

// ─── Approve teacher (owner grants invite code) ───────────────────────────────

export async function approveTeacher(
  id: string
): Promise<{ success: boolean; invite_code?: string; error?: string }> {
  const admin = createAdminClient();

  const { data: existing } = await admin.from("teachers").select("status, invite_code").eq("id", id).single();
  if (!existing) return { success: false, error: "المعلم غير موجود" };
  if (existing.status === "active") return { success: true, invite_code: existing.invite_code ?? undefined };

  const invite_code = existing.invite_code || (await generateUniqueInviteCode());

  const { error } = await admin
    .from("teachers")
    .update({ status: "active", invite_code, approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  // Seed default settings
  await admin
    .from("teacher_settings")
    .upsert({ teacher_id: id, dark_mode: false, enabled_levels: ["primary","preparatory","secondary"], enabled_grades: [1,2,3,4,5,6] });

  return { success: true, invite_code };
}

export async function rejectTeacher(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("teachers").update({ status: "rejected" }).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deactivateTeacher(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("teachers").update({ status: "inactive" }).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteTeacher(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  // Cascade is handled by FK ON DELETE CASCADE in the schema
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginTeacher(
  email: string,
  password: string
): Promise<{ success?: boolean; error?: string; role?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };

  // Fetch profile to check role & teacher status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "owner") return { success: true, role: "owner" };

  if (profile?.role === "teacher") {
    const { data: teacher } = await supabase
      .from("teachers")
      .select("status")
      .eq("id", data.user.id)
      .single();

    if (teacher?.status === "pending") {
      await supabase.auth.signOut();
      return { error: "حسابك قيد المراجعة. سيتم إشعارك عند الموافقة." };
    }
    if (teacher?.status === "rejected") {
      await supabase.auth.signOut();
      return { error: "تم رفض طلبك. يرجى التواصل مع الإدارة." };
    }
    if (teacher?.status === "inactive") {
      await supabase.auth.signOut();
      return { error: "تم إيقاف حسابك. يرجى التواصل مع الإدارة." };
    }
    return { success: true, role: "teacher" };
  }

  return { error: "غير مصرح بتسجيل الدخول" };
}
