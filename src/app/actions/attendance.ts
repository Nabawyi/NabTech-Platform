"use server";

import fs from "fs";
import path from "path";
import type { AttendanceRecord, SubscriptionRow } from "@/types/domain";
import { initDb, getUserSession } from "./students";
import { getActiveStudents } from "./subscriptions";

const dataDir = path.join(process.cwd(), "data");
const attendanceFile = path.join(dataDir, "attendance.json");

function parseAttendance(data: string): AttendanceRecord[] {
  return JSON.parse(data) as AttendanceRecord[];
}

export async function initAttendanceDb() {
  await initDb();
  if (!fs.existsSync(attendanceFile)) {
    fs.writeFileSync(attendanceFile, JSON.stringify([], null, 2));
  }
}

export async function getAttendance(teacherId?: string): Promise<AttendanceRecord[]> {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  let effectiveTeacherId = teacherId;
  if (session.role === "admin" || session.role === "student") {
    effectiveTeacherId = session.teacherId;
  }

  await initAttendanceDb();
  const data = fs.readFileSync(attendanceFile, "utf-8");
  const records = parseAttendance(data);
  return effectiveTeacherId ? records.filter(r => r.teacherId === effectiveTeacherId) : records;
}

export async function markAttendance(studentId: number, date: string, status: "present" | "absent", teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  await initAttendanceDb();
  // We need all records to overwrite properly
  const data = fs.readFileSync(attendanceFile, "utf-8");
  const records = parseAttendance(data);

  const normalizedDate = new Date(date).toISOString().split("T")[0];

  const existingIndex = records.findIndex(
    (r) => r.studentId === studentId && r.date === normalizedDate && r.teacherId === teacherId
  );

  if (existingIndex > -1) {
    records[existingIndex].status = status;
    records[existingIndex].updatedAt = new Date().toISOString();
  } else {
    records.push({
      id: Date.now(),
      studentId,
      teacherId,
      date: normalizedDate,
      status,
      createdAt: new Date().toISOString(),
    });
  }

  fs.writeFileSync(attendanceFile, JSON.stringify(records, null, 2));
  return true;
}

export async function getAttendanceByDate(date: string, teacherId?: string) {
  const records = await getAttendance(teacherId);
  const normalizedDate = new Date(date).toISOString().split("T")[0];
  return records.filter((r) => r.date === normalizedDate);
}

export async function getStudentAttendance(studentId: number) {
  const records = await getAttendance(); // Gets all, can be filtered by student
  return records.filter((r) => r.studentId === studentId);
}

export async function getAttendanceStats(teacherId?: string) {
  const records = await getAttendance(teacherId);
  const uniqueDates = new Set(records.map((r) => r.date));

  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;

  const todayDate = new Date().toISOString().split("T")[0];
  const todays = records.filter((r) => r.date === todayDate);
  const todayTotalRecords = todays.length;
  const todayPresent = todays.filter((r) => r.status === "present").length;
  const todayAbsent = todays.filter((r) => r.status === "absent").length;

  return {
    totalDays: uniqueDates.size,
    totalRecords,
    presentCount,
    absentCount,
    rate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,

    todayDate,
    todayTotalRecords,
    todayPresent,
    todayAbsent,
    todayRate: todayTotalRecords > 0 ? (todayPresent / todayTotalRecords) * 100 : 0,
  };
}

export async function bulkMarkAttendance(idList: number[], date: string, teacherId: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "owner")) throw new Error("Unauthorized");
  if (session.role === "admin" && teacherId !== session.teacherId) throw new Error("Unauthorized");

  await initAttendanceDb();
  // Get all to append properly without losing others' data
  const data = fs.readFileSync(attendanceFile, "utf-8");
  const allRecords = parseAttendance(data);
  const normalizedDate = new Date(date).toISOString().split("T")[0];

  const activeStudents = (await getActiveStudents(teacherId)) as SubscriptionRow[];

  const results = {
    present: 0,
    absent: 0,
    invalid: [] as number[],
  };

  // Keep records not matching this date, or not matching this teacher for this date
  const otherRecords = allRecords.filter(
    (r) => r.date !== normalizedDate || r.teacherId !== teacherId
  );
  const newDayRecords: AttendanceRecord[] = [];

  const idSet = new Set(idList);

  activeStudents.forEach((student) => {
    const isPresent = idSet.has(student.id);
    newDayRecords.push({
      id: Date.now() + Math.random(),
      studentId: student.id,
      teacherId,
      date: normalizedDate,
      status: isPresent ? "present" : "absent",
      createdAt: new Date().toISOString(),
    });

    if (isPresent) results.present++;
    else results.absent++;
  });

  const activeIds = new Set(activeStudents.map((s) => s.id));
  idList.forEach((id) => {
    if (!activeIds.has(id)) {
      results.invalid.push(id);
    }
  });

  const finalRecords = [...otherRecords, ...newDayRecords];
  fs.writeFileSync(attendanceFile, JSON.stringify(finalRecords, null, 2));

  return results;
}
