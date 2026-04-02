"use server";

import fs from "fs";
import path from "path";
import type { GroupFormPayload, GroupRecord, LocationRecord, StudentJsonRow } from "@/types/domain";
import { type Stage, isValidStageGrade } from "@/lib/education";
import { getUserSession } from "./students";

const dataDir = path.join(process.cwd(), "data");
const locationsFile = path.join(dataDir, "locations.json");
const studentsFile = path.join(dataDir, "students.json");

const initialLocations: LocationRecord[] = [
  {
    id: "loc1",
    name: "سمنود",
    teacherId: "teacher_1",
    groups: [
      {
        id: "grp1",
        name: "مجموعة السبت 4 عصراً",
        startTime: "16:00",
        endTime: "18:00",
        stage: "secondary",
        grade: 1,
        teacherId: "teacher_1",
      },
      {
        id: "grp2",
        name: "مجموعة الثلاثاء 2 ظهراً",
        startTime: "14:00",
        endTime: "16:00",
        stage: "secondary",
        grade: 1,
        teacherId: "teacher_1",
      },
    ],
  },
  {
    id: "loc2",
    name: "منية سمنود",
    teacherId: "teacher_1",
    groups: [
      {
        id: "grp3",
        name: "مجموعة الأحد 5 مساءً",
        startTime: "17:00",
        endTime: "19:00",
        stage: "secondary",
        grade: 1,
        teacherId: "teacher_1",
      },
    ],
  },
];

export async function initLocationsDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(locationsFile)) {
    fs.writeFileSync(locationsFile, JSON.stringify(initialLocations, null, 2));
  }
}

export async function getLocations(teacherId?: string): Promise<LocationRecord[]> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  let effectiveTeacherId = teacherId;
  if (session.role === "admin" || session.role === "student") {
    effectiveTeacherId = session.teacherId;
  }

  await initLocationsDb();
  const data = fs.readFileSync(locationsFile, "utf-8");
  const raw = JSON.parse(data) as LocationRecord[];
  
  const filtered = effectiveTeacherId 
    ? raw.filter(l => l.teacherId === effectiveTeacherId)
    : raw;

  return filtered.map((loc) => ({
    ...loc,
    groups: (loc.groups ?? []).map((g: unknown) => {
      const gg = g as Record<string, unknown>;
      const stage = (gg.stage ?? gg.level) as Stage | undefined;
      const gradeNumber = (gg.grade ?? gg.gradeNumber) as number | undefined;

      const normalizedStage: Stage | undefined =
        typeof stage === "string" && (["primary", "preparatory", "secondary"] as string[]).includes(stage)
          ? stage
          : undefined;

      const normalizedGrade =
        normalizedStage && typeof gradeNumber === "number" && Number.isFinite(gradeNumber) && isValidStageGrade(normalizedStage, gradeNumber)
          ? gradeNumber
          : undefined;

      return {
        ...gg,
        stage: normalizedStage,
        grade: normalizedGrade,
        startTime: String(gg.startTime ?? ""),
        endTime: String(gg.endTime ?? ""),
      } as GroupRecord;
    }),
  }));
}

function getStudents(teacherId?: string): StudentJsonRow[] {
  if (!fs.existsSync(studentsFile)) return [];
  const list = JSON.parse(fs.readFileSync(studentsFile, "utf-8")) as StudentJsonRow[];
  return teacherId ? list.filter(s => s.teacherId === teacherId) : list;
}

export async function addLocation(name: string, teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  const locations = await getLocations(); // All locations internally to avoid losing others
  const newLocation: LocationRecord = {
    id: "loc_" + Date.now(),
    name,
    teacherId,
    groups: [],
  };
  locations.push(newLocation);
  fs.writeFileSync(locationsFile, JSON.stringify(locations, null, 2));
  return newLocation;
}

export async function updateLocation(id: string, name: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const locations = await getLocations();
  const index = locations.findIndex((l) => l.id === id);
  if (index > -1) {
    if (session.role === "admin" && locations[index].teacherId !== session.teacherId) throw new Error("Unauthorized");
    locations[index].name = name;
    fs.writeFileSync(locationsFile, JSON.stringify(locations, null, 2));
    return { success: true };
  }
  return { success: false };
}

export async function deleteLocation(id: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const students = getStudents();
  const assigned = students.filter((s) => s.locationId === id);
  if (assigned.length > 0) {
    return {
      success: false,
      error: `لا يمكن الحذف — يوجد ${assigned.length} طالب مسجل في هذا السنتر`,
    };
  }
  const fullList = JSON.parse(fs.readFileSync(locationsFile, "utf-8")) as LocationRecord[];
  const loc = fullList.find((l) => l.id === id);
  if (!loc) return { success: false };
  if (session.role === "admin" && loc.teacherId !== session.teacherId) throw new Error("Unauthorized");

  const filtered = fullList.filter((l) => l.id !== id);
  fs.writeFileSync(locationsFile, JSON.stringify(filtered, null, 2));
  return { success: true };
}

export async function addGroup(locationId: string, groupData: GroupFormPayload, teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  const locations = JSON.parse(fs.readFileSync(locationsFile, "utf-8")) as LocationRecord[];
  const locIndex = locations.findIndex((l) => l.id === locationId);
  if (locIndex > -1) {
    const stage = groupData.stage as Stage | undefined;
    const grade = groupData.grade;
    if (!stage || typeof grade !== "number" || !isValidStageGrade(stage, grade)) {
      throw new Error("يجب اختيار مرحلة و صف صالحين للمجموعة.");
    }

    const newGroup: GroupRecord = {
      id: "grp_" + Date.now(),
      name: groupData.name,
      startTime: groupData.startTime,
      endTime: groupData.endTime,
      stage,
      grade,
      teacherId,
    };
    locations[locIndex].groups.push(newGroup);
    fs.writeFileSync(locationsFile, JSON.stringify(locations, null, 2));
    return newGroup;
  }
  return null;
}

export async function updateGroup(
  locationId: string,
  groupId: string,
  groupData: Partial<GroupFormPayload>
) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const locations = JSON.parse(fs.readFileSync(locationsFile, "utf-8")) as LocationRecord[];
  const locIndex = locations.findIndex((l) => l.id === locationId);
  if (locIndex > -1) {
    if (session.role === "admin" && locations[locIndex].teacherId !== session.teacherId) throw new Error("Unauthorized");
    const grpIndex = locations[locIndex].groups.findIndex((g) => g.id === groupId);
    if (grpIndex > -1) {
      const existing = locations[locIndex].groups[grpIndex];
      const stage = (groupData.stage ?? existing.stage) as Stage | undefined;
      const grade = (groupData.grade ?? existing.grade) as number | undefined;
      if (!stage || typeof grade !== "number" || !isValidStageGrade(stage, grade)) {
        throw new Error("يجب أن تكون مرحلة المجموعة وصفها صالحين.");
      }

      locations[locIndex].groups[grpIndex] = {
        ...locations[locIndex].groups[grpIndex],
        ...groupData,
        stage,
        grade,
      };
      fs.writeFileSync(locationsFile, JSON.stringify(locations, null, 2));
      return { success: true };
    }
  }
  return { success: false };
}

export async function deleteGroup(locationId: string, groupId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");

  const students = getStudents();
  const assigned = students.filter((s) => s.groupId === groupId);
  if (assigned.length > 0) {
    return {
      success: false,
      error: `لا يمكن الحذف — يوجد ${assigned.length} طالب في هذه المجموعة`,
    };
  }
  const locations = JSON.parse(fs.readFileSync(locationsFile, "utf-8")) as LocationRecord[];
  const locIndex = locations.findIndex((l) => l.id === locationId);
  if (locIndex > -1) {
    if (session.role === "admin" && locations[locIndex].teacherId !== session.teacherId) throw new Error("Unauthorized");
    locations[locIndex].groups = locations[locIndex].groups.filter((g) => g.id !== groupId);
    fs.writeFileSync(locationsFile, JSON.stringify(locations, null, 2));
    return { success: true };
  }
  return { success: false };
}

export async function getGroupStudentCounts(teacherId?: string) {
  const students = getStudents(teacherId);
  const counts: Record<string, number> = {};
  for (const s of students) {
    if (s.groupId) counts[s.groupId] = (counts[s.groupId] || 0) + 1;
  }
  return counts;
}
