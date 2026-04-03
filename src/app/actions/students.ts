"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGradeLabel, type SchoolLevel } from "@/lib/constants";
import { clampGradeForStage, normalizeStageGrade, type Stage, getGradeCode } from "@/lib/education";
import { validateEgyptianPhone } from "@/lib/validation";
import type { AddStudentPayload, StudentRow } from "@/types/domain";
import { loginTeacher } from "@/app/actions/teachers";

// ─── Session ──────────────────────────────────────────────────────────────────

export async function getUserSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, phone")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const role = profile.role as string;

  if (role === "owner") return { role: "owner", name: "مالك المنصة", id: user.id };

  if (role === "teacher") {
    return { role: "admin", teacherId: user.id, name: user.email ?? "", id: user.id };
  }

  if (role === "student") {
    // fetch student row
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("auth_id", user.id)
      .single();
    if (!student) return null;
    return {
      role: "student",
      id: student.id,
      teacherId: student.teacher_id,
      name: student.name,
      stage: student.stage,
      level: student.stage,
      gradeNumber: student.grade,
      grade: getGradeLabel(student.stage as SchoolLevel, student.grade),
      locationId: student.location_id,
      groupId: student.group_id,
      phone: student.phone,
      parentPhone: student.parent_phone,
    };
  }

  return null;
}

// ─── Read students ────────────────────────────────────────────────────────────

export async function getStudents(teacherId?: string): Promise<StudentRow[]> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");

  const supabase = await createClient();
  let effectiveTeacherId = teacherId;
  if (session.role === "admin" || session.role === "student") {
    effectiveTeacherId = session.teacherId;
  }

  let query = supabase.from("students").select("*").order("created_at", { ascending: false });
  if (effectiveTeacherId) query = query.eq("teacher_id", effectiveTeacherId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(mapStudentRow);
}

function mapStudentRow(s: any): StudentRow {
  return {
    id: s.id,
    teacherId: s.teacher_id,
    name: s.name,
    phone: s.phone,
    parentPhone: s.parent_phone,
    stage: s.stage,
    grade: s.grade,
    level: s.stage,
    gradeNumber: s.grade,
    gradeDisplay: getGradeLabel(s.stage as SchoolLevel, s.grade),
    gradeLabel: getGradeLabel(s.stage as SchoolLevel, s.grade),
    city: s.city ?? "",
    locationId: s.location_id ?? "",
    groupId: s.group_id ?? "",
    code: s.student_code ?? "",
    password: s.password ?? "",
    status: s.status,
    timestamp: s.created_at,
  } as unknown as StudentRow;
}

// ─── Generate Student Code ───────────────────────────────────────────────────

async function generateStudentCode(teacherId: string, stage: Stage, gradeNumber: number): Promise<string> {
  const admin = createAdminClient();
  const prefix = stage === "primary" ? "P" : stage === "preparatory" ? "M" : "S";
  const codePrefix = `${prefix}${gradeNumber}`;

  const { data } = await admin
    .from("students")
    .select("student_code")
    .eq("teacher_id", teacherId)
    .ilike("student_code", `${codePrefix}%`);

  let maxSequential = 0;
  for (const row of data || []) {
    if (!row.student_code) continue;
    const suffix = row.student_code.replace(codePrefix, "");
    const num = parseInt(suffix, 10);
    if (!isNaN(num) && num > maxSequential) {
      maxSequential = num;
    }
  }

  const nextNum = maxSequential + 1;
  const sequentialStr = nextNum.toString().padStart(3, "0"); // e.g., 001, 002
  return `${codePrefix}${sequentialStr}`;
}

// ─── Add student ──────────────────────────────────────────────────────────────

export async function addStudent(studentData: AddStudentPayload): Promise<StudentRow> {
  const session = await getUserSession();
  
  // RLS & API Authorization Logic
  if (session) {
    if (session.role === "student") throw new Error("Unauthorized");
    if (session.role === "admin" && studentData.teacherId !== session.teacherId) throw new Error("Unauthorized");
  } else {
    // Unauthenticated join flow: must provide inviteCode
    if (!studentData.inviteCode) throw new Error("Unauthorized: Missing invite code");
    
    // Validate invite_code truly matches the teacherId requested
    const admin = createAdminClient();
    const { data: validTeacher } = await admin
      .from("teachers")
      .select("id")
      .eq("invite_code", studentData.inviteCode)
      .eq("status", "active")
      .single();
      
    if (!validTeacher || validTeacher.id !== studentData.teacherId) {
      throw new Error("Unauthorized: Invalid teacher or invite code mismatch");
    }
  }

  const phoneValidation = validateEgyptianPhone(String(studentData.phone ?? ""), "رقم الطالب");
  if (!phoneValidation.valid) throw new Error(phoneValidation.error ?? "رقم الهاتف غير صالح");

  const parentPhoneValidation = validateEgyptianPhone(String(studentData.parentPhone ?? ""), "رقم ولي الأمر");
  if (!parentPhoneValidation.valid) throw new Error(parentPhoneValidation.error ?? "رقم ولي الأمر مطلوب");

  const parsed = normalizeStageGrade(studentData.stage ?? studentData.level, studentData.grade ?? studentData.gradeNumber);
  if (!parsed) throw new Error("المرحلة والصف غير صالحين");
  const { stage, grade } = parsed;

  const admin = createAdminClient();

  // Validate group belongs to the exact teacher and grade
  const grade_code = getGradeCode(stage, grade);
  if (studentData.groupId) {
    const { data: group } = await admin
      .from("groups")
      .select("teacher_id, grade_code")
      .eq("id", studentData.groupId)
      .single();
      
    if (!group) throw new Error("المجموعة غير موجودة");
    if (group.teacher_id !== studentData.teacherId) throw new Error("Unauthorized: المجموعة لا تتبع لهذا المعلم");
    if (group.grade_code !== grade_code) throw new Error("المجموعة لا تتوافق مع المرحلة أو الصف المختار");
  }

  // Check duplicate phone
  const { data: existing } = await admin.from("students").select("id").eq("phone", studentData.phone).maybeSingle();
  if (existing) throw new Error("رقم الهاتف مسجل مسبقاً");

  // Create a Supabase auth user with a virtual email so students can log in
  const virtualEmail = `${String(studentData.phone).trim()}@student.nabtech.app`;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: virtualEmail,
    password: String(studentData.password ?? ""),
    email_confirm: true,
  });

  let authId: string | null = null;
  if (!authError && authData?.user) {
    authId = authData.user.id;
    // Insert a profile row for the student
    await admin.from("profiles").insert({ id: authId, name: String(studentData.name ?? ""), role: "student", phone: String(studentData.phone) });
  }

  const { data: newStudent, error: insertError } = await admin.from("students").insert({
    auth_id: authId,
    teacher_id: studentData.teacherId,
    name: String(studentData.name ?? ""),
    phone: String(studentData.phone ?? ""),
    parent_phone: String(studentData.parentPhone ?? ""),
    stage,
    grade,
    grade_code: getGradeCode(stage, grade),
    student_code: null, // Generated upon activation
    city: String(studentData.city ?? "غير محدد") || "غير محدد",
    group_id: studentData.groupId || null,
    password: String(studentData.password ?? ""),
    status: "pending",
  }).select().single();

  if (insertError) {
    if (authId) await admin.auth.admin.deleteUser(authId);
    throw new Error(insertError.message);
  }

  return mapStudentRow(newStudent);
}

// ─── Update status ────────────────────────────────────────────────────────────

export async function updateStudentStatus(id: string, status: string): Promise<boolean> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();

  // Validate teacher_id matches
  const { data: student } = await admin.from("students").select("teacher_id, stage, grade, student_code").eq("id", id).single();
  if (!student) throw new Error("Student not found");
  if (session.role === "admin" && student.teacher_id !== session.teacherId) throw new Error("Unauthorized");

  const updatePayload: any = { status };

  // Issue 2: Generate student_code ONLY upon physical activation, if missing
  if (status === "active" && !student.student_code) {
     updatePayload.student_code = await generateStudentCode(student.teacher_id, student.stage, student.grade);
  }

  const { error } = await admin.from("students").update(updatePayload).eq("id", id);
  if (error) throw new Error(error.message);
  
  // Also activate their subscription
  if (status === "active") {
    const { activateSubscription } = await import("./subscriptions");
    try {
      // Do not wait if it fails, or maybe just proceed
      await activateSubscription(id);
    } catch(e) {
      console.warn("Could not auto-activate sub:", e);
    }
  }

  return true;
}

export async function approveStudent(id: string) { return updateStudentStatus(id, "active"); }
export async function rejectStudent(id: string) { return updateStudentStatus(id, "rejected"); }

// ─── Login (owner + teacher + student) ───────────────────────────────────────

export async function loginUser(phone: string, pass: string) {
  // Owner
  if (phone === "owner" && pass === "owner123") {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "owner@nabtech.app",
      password: "owner123",
    });
    if (error || !data?.user) return { error: "خطأ في تسجيل دخول المالك" };
    
    // Ensure owner profile exists
    const admin = createAdminClient();
    const { data: existingProfile } = await admin.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
    if (!existingProfile) {
      await admin.from("profiles").insert({
        id: data.user.id,
        name: "مالك المنصة",
        role: "owner",
        phone: "owner"
      });
    }

    return { success: true, role: "owner" };
  }

  // Teacher login (email)
  if (phone.includes("@")) {
    const result = await loginTeacher(phone, pass);
    if (result.success) return { success: true, role: result.role === "owner" ? "owner" : "admin" };
    if (result.error) return { error: result.error };
  }

  // Student login (phone → virtual email)
  const virtualEmail = `${phone.trim()}@student.nabtech.app`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: virtualEmail, password: pass });
  if (error || !data?.user) return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" };

  // Check student status
  const admin = createAdminClient();
  const { data: student } = await admin.from("students").select("status").eq("auth_id", data.user.id).single();
  if (student?.status === "pending") {
    await supabase.auth.signOut();
    return { error: "حسابك لا يزال قيد المراجعة ولم يتم تفعيله بعد" };
  }
  if (student?.status === "rejected") {
    await supabase.auth.signOut();
    return { error: "تم إيقاف حسابك، يرجى مراجعة الإدارة" };
  }

  return { success: true, role: "student" };
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

// ─── Update group ─────────────────────────────────────────────────────────────

export async function updateStudentGroup(id: string, locationId: string, groupId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();
  if (session.role === "admin") {
    const { data: student } = await admin.from("students").select("teacher_id").eq("id", id).single();
    if (student?.teacher_id !== session.teacherId) throw new Error("Unauthorized");
  }

  const { error } = await admin.from("students").update({ group_id: groupId || null }).eq("id", id);
  if (error) return { success: false };
  return { success: true };
}

// ─── Delete student ───────────────────────────────────────────────────────────

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();
  const { data: student } = await admin.from("students").select("auth_id, teacher_id").eq("id", id).single();
  if (!student) return { success: false, error: "الطالب غير موجود" };
  if (session.role === "admin" && student.teacher_id !== session.teacherId) return { success: false, error: "Unauthorized" };

  // FK CASCADE handles subscriptions, attendance, quiz_results
  const { error } = await admin.from("students").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  // Delete the auth user too
  if (student.auth_id) await admin.auth.admin.deleteUser(student.auth_id);

  return { success: true };
}

export async function deleteAllStudents(teacherId?: string): Promise<{ success: boolean; deletedCount: number }> {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();
  let effectiveTeacherId = teacherId;
  if (session.role === "admin") effectiveTeacherId = session.teacherId;

  let query = admin.from("students").select("id, auth_id");
  if (effectiveTeacherId) query = (query as any).eq("teacher_id", effectiveTeacherId);
  const { data: toDelete } = await query;
  if (!toDelete || toDelete.length === 0) return { success: true, deletedCount: 0 };

  const ids = toDelete.map((s: any) => s.id);
  await admin.from("students").delete().in("id", ids);

  // Delete auth users
  for (const s of toDelete as any[]) {
    if (s.auth_id) await admin.auth.admin.deleteUser(s.auth_id);
  }

  return { success: true, deletedCount: toDelete.length };
}

export { validateEgyptianPhone };
