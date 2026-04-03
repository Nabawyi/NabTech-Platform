"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { GroupFormPayload, GroupRecord, LocationRecord } from "@/types/domain";
import { getGradeCode, type Stage, isValidStageGrade } from "@/lib/education";
import { getUserSession } from "./students";
import { revalidatePath } from "next/cache";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Groups in Supabase are flat. We map them to the LocationRecord shape
// by grouping on location_name (used as the "location" concept).

function mapGroup(g: any): GroupRecord {
  return {
    id: g.id,
    name: g.name,
    startTime: g.start_time ?? "",
    endTime: g.end_time ?? "",
    stage: g.stage as Stage,
    grade: g.grade,
    gradeCode: g.grade_code ?? getGradeCode(g.stage, g.grade),
    teacherId: g.teacher_id,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getLocations(teacherId?: string, gradeCode?: string): Promise<LocationRecord[]> {
  const session = await getUserSession();
  
  let effectiveTeacherId = teacherId;
  if (session && (session.role === "admin" || session.role === "student")) {
    effectiveTeacherId = session.teacherId;
  }
  
  if (!effectiveTeacherId) throw new Error("Teacher ID is required");

  const admin = createAdminClient();
  let query = admin.from("groups").select("*").order("created_at");
  if (effectiveTeacherId) query = query.eq("teacher_id", effectiveTeacherId);
  if (gradeCode) query = query.eq("grade_code", gradeCode);

  console.log(`[getLocations] Teacher context: ${effectiveTeacherId}`);
  const { data, error } = await query;
  if (error) {
    console.error(`[getLocations] Error fetching groups: ${error.message}`);
    throw new Error(error.message);
  }
  
  console.log(`[getLocations] Found ${data?.length || 0} groups total.`);


  // Group by location_name to keep the LocationRecord shape
  const locationMap = new Map<string, LocationRecord>();
  for (const g of data ?? []) {
    const locKey = g.location_name ?? "افتراضي";
    const locId = g.location_id ?? locKey;
    if (!locationMap.has(locKey)) {
      locationMap.set(locKey, { id: locId, name: locKey, teacherId: g.teacher_id, groups: [] });
    }
    locationMap.get(locKey)!.groups.push(mapGroup(g));
  }
  return Array.from(locationMap.values());
}

// ─── Location CRUD ────────────────────────────────────────────────────────────

export async function addLocation(name: string, teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");
  // Locations are virtual (stored on group rows). Return a stub.
  const id = "loc_" + Date.now();
  return { id, name, teacherId, groups: [] } as LocationRecord;
}

export async function updateLocation(id: string, name: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { error } = await admin.from("groups").update({ location_name: name }).eq("location_id", id);
  if (error) return { success: false };
  revalidatePath("/teacher/groups");
  return { success: true };
}

export async function deleteLocation(id: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  const admin = createAdminClient();
  // Check if students are assigned
  const { data: students } = await admin.from("students").select("id").eq("group_id", id).limit(1);
  if (students && students.length > 0) {
    return { success: false, error: `لا يمكن الحذف — يوجد طلاب مسجلون في هذا السنتر` };
  }
  await admin.from("groups").delete().eq("location_id", id);
  revalidatePath("/teacher/groups");
  return { success: true };
}

// ─── Group CRUD ───────────────────────────────────────────────────────────────

export async function addGroup(locationId: string, groupData: GroupFormPayload, teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  const stage = groupData.stage as Stage | undefined;
  const grade = groupData.grade;
  if (!stage || typeof grade !== "number" || !isValidStageGrade(stage, grade)) {
    throw new Error("يجب اختيار مرحلة وصف صالحين للمجموعة.");
  }

  const admin = createAdminClient();
  const grade_code = getGradeCode(stage, grade);
  
  console.log(`[addGroup] Creating group: ${groupData.name} for teacher: ${teacherId} with gradeCode: ${grade_code}`);
  
  const { data, error } = await admin.from("groups").insert({
    teacher_id: teacherId,
    name: groupData.name,
    start_time: groupData.startTime,
    end_time: groupData.endTime,
    stage,
    grade,
    grade_code,
    location_id: locationId,
    location_name: groupData.locationName ?? locationId,
  }).select().single();

  if (error) {
    console.error(`[addGroup] Insert failed: ${error.message}`);
    throw new Error(error.message);
  }
  
  console.log(`[addGroup] Successfully created group ID: ${data.id}`);

  revalidatePath("/teacher/groups");
  return mapGroup(data);
}

export async function updateGroup(locationId: string, groupId: string, groupData: Partial<GroupFormPayload>) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { data: existing } = await admin.from("groups").select("*").eq("id", groupId).single();
  if (!existing) return { success: false };
  if (session.role === "admin" && existing.teacher_id !== session.teacherId) throw new Error("Unauthorized");

  const stage = (groupData.stage ?? existing.stage) as Stage;
  const grade = (groupData.grade ?? existing.grade) as number;
  if (!isValidStageGrade(stage, grade)) throw new Error("يجب أن تكون مرحلة المجموعة وصفها صالحين.");

  const { error } = await admin.from("groups").update({
    name: groupData.name ?? existing.name,
    start_time: groupData.startTime ?? existing.start_time,
    end_time: groupData.endTime ?? existing.end_time,
    stage,
    grade,
    grade_code: getGradeCode(stage, grade),
  }).eq("id", groupId);


  if (error) return { success: false };
  revalidatePath("/teacher/groups");
  return { success: true };
}

export async function deleteGroup(locationId: string, groupId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { data: students } = await admin.from("students").select("id").eq("group_id", groupId).limit(1);
  if (students && students.length > 0) {
    return { success: false, error: `لا يمكن الحذف — يوجد طلاب في هذه المجموعة` };
  }

  const { data: group } = await admin.from("groups").select("teacher_id").eq("id", groupId).single();
  if (!group) return { success: false };
  if (session.role === "admin" && group.teacher_id !== session.teacherId) throw new Error("Unauthorized");

  await admin.from("groups").delete().eq("id", groupId);
  revalidatePath("/teacher/groups");
  return { success: true };
}

export async function getGroupStudentCounts(teacherId?: string) {
  const admin = createAdminClient();
  let query = admin.from("students").select("group_id");
  if (teacherId) query = query.eq("teacher_id", teacherId);
  const { data } = await query;

  const counts: Record<string, number> = {};
  for (const s of data ?? []) {
    if (s.group_id) counts[s.group_id] = (counts[s.group_id] || 0) + 1;
  }
  return counts;
}
