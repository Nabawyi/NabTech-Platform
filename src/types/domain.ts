export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "expiring_soon";

export type Subscription = {
  studentId: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
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
  email?: unknown;
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
  email?: string;
  phone?: string;
  parentPhone?: string;
  password?: string;
  status?: string;
  name?: string;
  locationId?: string;
  groupId?: string;
  groupName?: string;
  code?: string;
  gradeLabel?: string;
  grade?: number;
  gradeNumber?: number;
  gradeCode?: string;
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

// ─── Exam & Grades ───────────────────────────────────────────────────────────

export type ExamType = 'quiz' | 'midterm' | 'final';

export type ExamRow = {
  id: string;
  title: string;
  type: ExamType;
  total_score: number;
  grade_code: string;
  teacher_id: string;
  created_at: string;
};

export type ExamResultRow = {
  id: string;
  exam_id: string;
  student_id: string;
  score: number | null;
  created_at: string;
};

/** Joined: exam + one student's result (for score-entry table) */
export type StudentExamEntry = {
  student_id: string;
  student_name: string;
  result_id: string | null;
  score: number | null;
};

/** Joined: exam_result + exam meta (for student results page) */
export type StudentResultRow = {
  result_id: string;
  exam_id: string;
  exam_title: string;
  exam_type: ExamType;
  total_score: number;
  score: number | null;
  created_at: string;
};

/** Payload for bulk upsert */
export type StudentScoreEntry = {
  exam_id: string;
  student_id: string;
  score: number | null;
};
