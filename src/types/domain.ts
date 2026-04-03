export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "expiring_soon";

export type Subscription = {
  studentId: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  teacherId?: string;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string;
  status: "present" | "absent";
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
};

export type GroupRecord = {
  id: string;
  name: string;
  stage?: "primary" | "preparatory" | "secondary";
  grade?: number;
  gradeCode: string;
  startTime: string;
  endTime: string;
  teacherId: string;
};

export type LocationRecord = {
  id: string;
  name: string;
  groups: GroupRecord[];
  teacherId: string;
};

export type StudentJsonRow = {
  id: string;
  teacherId: string;
  locationId?: string;
  groupId?: string;
  phone?: string;
  password?: string;
  status?: string;
  name?: string;
};

/** Join form / API payload (values often come from FormData). */
export type AddStudentPayload = {
  teacherId: string;
  inviteCode?: string;
  name: unknown;
  phone: unknown;
  parentPhone: unknown;
  stage?: unknown;
  level?: unknown;
  grade?: unknown;
  gradeNumber?: unknown;
  city?: unknown;
  locationId?: unknown;
  groupId?: unknown;
  password: unknown;
};

/** Normalized student row from getStudents / getSubscriptions */
export type StudentRow = Record<string, unknown> & {
  id: string;
  teacherId: string;
  phone?: string;
  parentPhone?: string;
  password?: string;
  status?: string;
  name?: string;
  locationId?: string;
  groupId?: string;
  gradeLabel?: string;
  grade?: number;
  gradeNumber?: number;
};

export type SubscriptionRow = StudentRow & {
  subscription: Subscription | null;
  calculatedStatus: SubscriptionStatus;
  daysRemaining: number;
};

export type GroupFormPayload = {
  name: string;
  stage?: "primary" | "preparatory" | "secondary";
  grade?: number;
  startTime: string;
  endTime: string;
  locationName?: string;
};
