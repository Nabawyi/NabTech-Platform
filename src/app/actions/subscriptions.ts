"use server";

import fs from "fs";
import path from "path";
import type { Subscription, SubscriptionRow, SubscriptionStatus } from "@/types/domain";
import { getStudents } from "./students";

const dataDir = path.join(process.cwd(), "data");
const subsFile = path.join(dataDir, "subscriptions.json");

export type { Subscription, SubscriptionStatus } from "@/types/domain";

function initSubs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(subsFile)) fs.writeFileSync(subsFile, "[]");
}

function readSubs(): Subscription[] {
  initSubs();
  return JSON.parse(fs.readFileSync(subsFile, "utf-8"));
}

function writeSubs(subs: Subscription[]) {
  fs.writeFileSync(subsFile, JSON.stringify(subs, null, 2));
}

function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

export async function getSubscriptions(teacherId?: string): Promise<SubscriptionRow[]> {
  const subs = readSubs();
  const students = await getStudents(teacherId);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return students.map((s) => {
    const sub = subs.find((sub: Subscription) => sub.studentId === s.id);
    let calculatedStatus: SubscriptionStatus = "inactive";
    let daysRemaining = 0;

    if (sub && sub.status === "active") {
      const end = new Date(sub.endDate);
      const diffTime = end.getTime() - today.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      if (diffTime < 0) {
        calculatedStatus = "expired";
        daysRemaining = 0;
      } else if (daysRemaining <= 3) {
        calculatedStatus = "expiring_soon";
      } else {
        calculatedStatus = "active";
      }
    } else if (sub && sub.status === "inactive") {
      calculatedStatus = "inactive";
    }

    return {
      ...s,
      subscription: sub ?? null,
      calculatedStatus,
      daysRemaining,
    } as unknown as SubscriptionRow;
  });
}

export async function activateSubscription(studentId: number, teacherId?: string) {
  const subs = readSubs();
  const idx = subs.findIndex((s) => s.studentId === studentId);
  
  const startDate = new Date();
  const endDate = getLastDayOfMonth(startDate);

  const newSub: Subscription = {
    studentId,
    teacherId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: "active"
  };

  if (idx > -1) {
    subs[idx] = { ...subs[idx], ...newSub };
  } else {
    subs.push(newSub);
  }

  writeSubs(subs);
  return { success: true };
}

export async function renewSubscription(studentId: number, teacherId?: string) {
  const subs = readSubs();
  const idx = subs.findIndex((s: Subscription) => s.studentId === studentId);
  if (idx === -1) return activateSubscription(studentId, teacherId);

  const currentEnd = new Date(subs[idx].endDate);
  const today = new Date();
  
  // If already expired, start from today and end at end of this month
  // If still active, extend current end date to end of NEXT month
  const baseDate = currentEnd > today ? currentEnd : today;
  const newEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 0, 23, 59, 59);

  subs[idx].endDate = newEnd.toISOString();
  subs[idx].status = "active";
  if (teacherId) subs[idx].teacherId = teacherId;

  writeSubs(subs);
  return { success: true };
}

export async function deactivateSubscription(studentId: number) {
  const subs = readSubs();
  const idx = subs.findIndex((s: Subscription) => s.studentId === studentId);
  if (idx > -1) {
    subs[idx].status = "inactive";
    writeSubs(subs);
    return { success: true };
  }
  return { success: false };
}
export async function getActiveStudents(teacherId?: string): Promise<SubscriptionRow[]> {
  const students = await getSubscriptions(teacherId);
  return students
    .filter(
      (s: any) => s.calculatedStatus === "active" || s.calculatedStatus === "expiring_soon"
    )
    .map((s: any) => ({ ...s, isActive: true })) as SubscriptionRow[];
}

export async function getStudentSubscription(studentId: number): Promise<SubscriptionRow | null> {
  const students = await getSubscriptions();
  return students.find((s) => s.id === studentId) || null;
}
