"use server";

import { getStudents } from "@/app/actions/students";
import { getAttendanceStats as getAttendanceStatsFromAttendance } from "@/app/actions/attendance";
import { getLocations, getGroupStudentCounts } from "@/app/actions/locations";
import { getSubscriptions } from "@/app/actions/subscriptions";
import { type SchoolLevel } from "@/lib/constants";
import { studentHasCompleteStageGrade, type Stage } from "@/lib/education";

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

export type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;

  totalGroups: number;
  emptyGroups: number;
  studentsPerStage: Record<SchoolLevel, number>;

  attendance: AttendanceInsights;
  subscription: SubscriptionInsights;
  alerts: {
    expiredStudents: Array<{ id: number; name: string }>;
    inactiveStudents: Array<{ id: number; name: string }>;
    emptyGroupIds: string[];
  };
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
  const activeSubscriptions = subs.filter((s) => s.calculatedStatus === "active").length;
  const expiredSubscriptions = subs.filter((s) => s.calculatedStatus === "expired").length;
  const needingRenewal = subs.filter((s) => s.calculatedStatus === "expiring_soon").length;
  const inactiveSubscriptions = subs.filter((s) => s.calculatedStatus === "inactive").length;

  return {
    activeSubscriptions,
    expiredSubscriptions,
    needingRenewal,
    inactiveSubscriptions,
  };
}

export async function getDashboardStats(teacherId?: string): Promise<DashboardStats> {
  const [students, subscriptions, attendanceStats, locations, groupCounts] = await Promise.all([
    getStudents(teacherId),
    getSubscriptions(teacherId),
    getAttendanceStatsFromAttendance(teacherId),
    getLocations(teacherId),
    getGroupStudentCounts(teacherId),
  ]);

  const totalStudents = students.length;
  const activeStudents = subscriptions.filter(
    (s) => s.calculatedStatus === "active" || s.calculatedStatus === "expiring_soon"
  ).length;
  const inactiveStudents = subscriptions.filter((s) => s.calculatedStatus === "inactive").length;

  const studentsPerStage: Record<SchoolLevel, number> = {
    primary: 0,
    preparatory: 0,
    secondary: 0,
  };

  students.forEach((s) => {
    if (!studentHasCompleteStageGrade(s)) return;
    if (s.stage === "primary" || s.stage === "preparatory" || s.stage === "secondary") {
      studentsPerStage[s.stage as Stage] += 1;
    }
  });

  const allGroups = locations.flatMap((l) => l.groups ?? []);
  const totalGroups = allGroups.length;
  const emptyGroupIds = allGroups
    .filter((g) => (groupCounts[g.id] ?? 0) === 0)
    .map((g) => g.id);
  const emptyGroups = emptyGroupIds.length;

  const subscription = {
    activeSubscriptions: subscriptions.filter((s) => s.calculatedStatus === "active").length,
    expiredSubscriptions: subscriptions.filter((s) => s.calculatedStatus === "expired").length,
    needingRenewal: subscriptions.filter((s) => s.calculatedStatus === "expiring_soon").length,
  };

  const expiredStudents = subscriptions
    .filter((s) => s.calculatedStatus === "expired")
    .slice(0, 10)
    .map((s) => ({ id: s.id, name: String(s.name ?? "") }));

  const inactiveStudentsList = subscriptions
    .filter((s) => s.calculatedStatus === "inactive")
    .slice(0, 10)
    .map((s) => ({ id: s.id, name: String(s.name ?? "") }));

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    totalGroups,
    emptyGroups,
    studentsPerStage,
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
  };
}

