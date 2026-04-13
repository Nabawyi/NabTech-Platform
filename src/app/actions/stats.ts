"use server";

import { getStudents, getUserSession } from "@/app/actions/students";
import { getAttendanceStats as getAttendanceStatsFromAttendance } from "@/app/actions/attendance";
import { getLocations, getGroupStudentCounts } from "@/app/actions/locations";
import { getSubscriptions } from "@/app/actions/subscriptions";
import { type SchoolLevel } from "@/lib/constants";
import { studentHasCompleteStageGrade, type Stage } from "@/lib/education";
import type { SubscriptionRow, StudentRow, AttendanceRecord, LocationRecord } from "@/types/domain";

export type AttendanceInsights = {
  todayTotalRecords: number;
  todayAbsent: number;
  todayRate: number; // %
};

export type SubscriptionInsights = {
  activeSubscriptions: number;
  expiredSubscriptions: number;
  needingRenewal: number; // expiring_soon
};

export type GradeStat = {
  code: string;
  label: string;
  count: number;
  percentage: number;
  levelName: string;
};

export type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  pendingStudentsCount: number;

  totalGroups: number;
  emptyGroups: number;
  
  gradeStats: GradeStat[];

  attendance: AttendanceInsights;
  subscription: SubscriptionInsights;
  alerts: {
    expiredStudents: Array<{ id: string; name: string }>;
    inactiveStudents: Array<{ id: string; name: string }>;
    emptyGroupIds: string[];
  };
  recentStudents: Array<StudentRow>;
};

export async function getAttendanceStats(): Promise<AttendanceInsights> {
  const stats = await getAttendanceStatsFromAttendance();
  return {
    todayTotalRecords: stats.todayTotalRecords ?? 0,
    todayAbsent: stats.todayAbsent ?? 0,
    todayRate: stats.todayRate ?? 0,
  };
}

export async function getSubscriptionStats(teacherId?: string): Promise<SubscriptionInsights & { inactiveSubscriptions: number }> {
  const subs = await getSubscriptions(teacherId);
  const activeSubscriptions = subs.filter((s: SubscriptionRow) => s.calculatedStatus === "active").length;
  const expiredSubscriptions = subs.filter((s: SubscriptionRow) => s.calculatedStatus === "expired").length;
  const needingRenewal = subs.filter((s: SubscriptionRow) => s.calculatedStatus === "expiring_soon").length;
  const inactiveSubscriptions = subs.filter((s: SubscriptionRow) => s.calculatedStatus === "inactive").length;

  return {
    activeSubscriptions,
    expiredSubscriptions,
    needingRenewal,
    inactiveSubscriptions,
  };
}

export async function getDashboardStats(teacherId?: string, clientGradeCodes?: string[]): Promise<DashboardStats> {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore(); // Disable all Next.js caching for this request to ensure fresh data always

  const session = await getUserSession();
  if (!session || session.role === "student") throw new Error("Unauthorized");

  const [students, subscriptions, attendanceStats, locations, groupCounts] = await Promise.all([
    getStudents(teacherId),
    getSubscriptions(teacherId),
    getAttendanceStatsFromAttendance(teacherId),
    getLocations(teacherId),
    getGroupStudentCounts(teacherId),
  ]);

  const { getTeacherSettings } = await import("./settings");
  // Always use the latest client-provided codes if available to prevent any caching desyncs
  const settings = await getTeacherSettings(teacherId);
  const effectiveGradeCodes = clientGradeCodes && clientGradeCodes.length > 0 
    ? clientGradeCodes 
    : settings.enabled_grade_codes;

  const totalStudents = students.length;
  const pendingStudentsCount = students.filter(s => s.status === "pending").length;
  const activeStudents = subscriptions.filter(
    (s: SubscriptionRow) => s.calculatedStatus === "active" || s.calculatedStatus === "expiring_soon"
  ).length;
  const inactiveStudents = subscriptions.filter((s: SubscriptionRow) => s.calculatedStatus === "inactive").length;

  // Group students by grade_code
  const countsByGrade: Record<string, number> = {};
  students.forEach((s) => {
    if (s.gradeCode) {
      countsByGrade[s.gradeCode] = (countsByGrade[s.gradeCode] || 0) + 1;
    }
  });

  // Build grade stats based on what's ENABLED in settings
  // This ensures the dashboard reflects settings exactly
  const { getGradeLabel } = await import("@/lib/constants");
  
  const gradeStats: GradeStat[] = effectiveGradeCodes.map(code => {
    const parts = code.split("_"); // pri_1, pre_1, sec_1
    const stage = parts[0] === "pri" ? "primary" : parts[0] === "pre" ? "preparatory" : "secondary";
    const num = parseInt(parts[1], 10);
    const count = countsByGrade[code] || 0;
    
    return {
      code,
      label: getGradeLabel(stage as any, num),
      levelName: stage === "primary" ? "الابتدائي" : stage === "preparatory" ? "الإعدادي" : "الثانوي",
      count,
      percentage: totalStudents > 0 ? (count / totalStudents) * 100 : 0
    };
  });

  const allGroups = (locations as unknown as LocationRecord[]).flatMap((l) => l.groups ?? []);
  const totalGroups = allGroups.length;
  const emptyGroupIds = allGroups
    .filter((g) => (groupCounts[g.id] ?? 0) === 0)
    .map((g) => g.id);
  const emptyGroups = emptyGroupIds.length;

  const subscription = {
    activeSubscriptions: subscriptions.filter((s: SubscriptionRow) => s.calculatedStatus === "active").length,
    expiredSubscriptions: subscriptions.filter((s: SubscriptionRow) => s.calculatedStatus === "expired").length,
    needingRenewal: subscriptions.filter((s: SubscriptionRow) => s.calculatedStatus === "expiring_soon").length,
  };

  const expiredStudents = subscriptions
    .filter((s: SubscriptionRow) => s.calculatedStatus === "expired")
    .slice(0, 10)
    .map((s: SubscriptionRow) => ({ id: s.id, name: String(s.name ?? "") }));

  const inactiveStudentsList = subscriptions
    .filter((s: SubscriptionRow) => s.calculatedStatus === "inactive")
    .slice(0, 10)
    .map((s: SubscriptionRow) => ({ id: s.id, name: String(s.name ?? "") }));

  const recentStudents = students.slice(0, 5);

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    pendingStudentsCount,
    totalGroups,
    emptyGroups,
    gradeStats,
    attendance: {
      todayTotalRecords: attendanceStats.todayTotalRecords ?? 0,
      todayAbsent: attendanceStats.todayAbsent ?? 0,
      todayRate: attendanceStats.todayRate ?? 0,
    },
    subscription,
    alerts: {
      expiredStudents,
      inactiveStudents: inactiveStudentsList,
      emptyGroupIds,
    },
    recentStudents,
  };
}

