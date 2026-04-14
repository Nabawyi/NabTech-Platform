"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MessageCircle,
  Copy,
  Check,
  Mail,
  Shield,
  AlertTriangle,
  Trash2,
  Ban,
  Power,
  Search,
  Phone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  GraduationCap,
  Hash,
  Calendar,
  X,
  Sun,
  Moon,
  BookOpen,
} from "lucide-react";
import {
  getTeachers,
  approveTeacher,
  rejectTeacher,
  deactivateTeacher,
  deleteTeacher,
  type TeacherRecord,
} from "@/app/actions/teachers";
import { getAllTeacherStats, type TeacherStats } from "@/app/actions/ownerStats";
import { useTheme } from "@/components/ThemeProvider";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatWhatsAppUrl = (phone: string) => {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  const formatted = clean.startsWith("0")
    ? "2" + clean
    : clean.startsWith("20")
    ? clean
    : "20" + clean;
  return `https://wa.me/${formatted}`;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    active: {
      label: "مفعّل",
      cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
      icon: <UserCheck className="w-3 h-3" />,
    },
    pending: {
      label: "قيد المراجعة",
      cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
      icon: <Clock className="w-3 h-3" />,
    },
    inactive: {
      label: "موقوف",
      cls: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      icon: <Ban className="w-3 h-3" />,
    },
    rejected: {
      label: "مرفوض",
      cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const c = config[status] ?? config.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ─── CountBadge ──────────────────────────────────────────────────────────────

function CountBadge({
  icon,
  count,
  label,
  color,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${color}`}
      title={label}
    >
      {icon}
      {count}
    </span>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  activeCls,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  activeCls: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-right p-5 rounded-2xl border transition-all duration-200 ${
        isActive
          ? `${activeCls} shadow-lg scale-[1.02]`
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md hover:scale-[1.01]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
          isActive ? "bg-white/20" : "bg-gray-50 dark:bg-gray-800 group-hover:scale-110"
        }`}>
          {icon}
        </div>
        <TrendingUp className={`w-4 h-4 transition-opacity ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600"}`} />
      </div>
      <div className="mt-3">
        <p className={`text-3xl font-black tracking-tight ${isActive ? "" : "text-gray-900 dark:text-white"}`}>
          {value}
        </p>
        <p className={`text-xs font-bold mt-0.5 ${isActive ? "opacity-80" : "text-gray-500 dark:text-gray-400"}`}>
          {label}
        </p>
      </div>
    </button>
  );
}

// ─── ThemeToggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className="flex items-center gap-2 px-3 py-2 bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-white/80 hover:text-white transition-all border border-white/10"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{theme === "dark" ? "نهاري" : "ليلي"}</span>
    </button>
  );
}

// ─── SkeletonRow ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800">
      {[...Array(9)].map((_, i) => (
        // index-based key is fine for purely decorative/static skeleton items
        <td key={`skel-${i}`} className="px-5 py-4">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" style={{ width: `${55 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <tr>
      <td colSpan={9} className="py-20">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-black text-gray-400 dark:text-gray-500">
            {filter === "pending" ? "لا يوجد طلبات حالياً" : "لا يوجد معلمون في هذه الفئة"}
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 font-bold">
            {filter === "pending" ? "طلبات التسجيل الجديدة ستظهر هنا" : "جرّب تغيير الفلتر"}
          </p>
        </div>
      </td>
    </tr>
  );
}

// ─── TeacherDetailPanel ──────────────────────────────────────────────────────

function TeacherDetailPanel({
  teacher,
  stats,
}: {
  teacher: TeacherRecord;
  stats: TeacherStats | undefined;
}) {
  return (
    <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
      <td colSpan={9} className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">معلومات التواصل</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span dir="ltr" className="truncate">{teacher.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span dir="ltr">{teacher.phone || "—"}</span>
                {teacher.phone && (
                  <a
                    href={formatWhatsAppUrl(teacher.phone) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-auto px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    واتساب
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">التواريخ</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-gray-400 dark:text-gray-500">التسجيل:</span>
                <span>{formatDate(teacher.created_at)}</span>
              </div>
              {teacher.approved_at && (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-400 dark:text-gray-500">التفعيل:</span>
                  <span>{formatDate(teacher.approved_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats + Invite Code */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">الإحصائيات</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20 text-xs font-black">
                <Users className="w-3.5 h-3.5" />
                {stats?.studentCount ?? 0} طالب
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-500/20 text-xs font-black">
                <BookOpen className="w-3.5 h-3.5" />
                {stats?.groupCount ?? 0} مجموعة
              </span>
            </div>
            {teacher.invite_code && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 dark:border-primary/20 mt-1">
                <Hash className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-black text-primary tracking-widest text-sm flex-1">{teacher.invite_code}</span>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  description,
  highlight,
  highlightCls,
  iconEl,
  confirmLabel,
  confirmCls,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  description: string;
  highlight: string;
  highlightCls: string;
  iconEl: React.ReactNode;
  confirmLabel: string;
  confirmCls: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5">{iconEl}</div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
          <div className={`mt-4 px-4 py-3 rounded-2xl border w-full text-right ${highlightCls}`}>
            <p className="text-sm font-black">{highlight}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`py-3.5 rounded-2xl font-black transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${confirmCls}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, TeacherStats>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [filter, setFilter] = useState<"pending" | "active" | "inactive" | "all">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [deactivateTarget, setDeactivateTarget] = useState<TeacherRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherRecord | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = async (silent = false) => {
    if (!silent) {
      // initial load — show skeleton
    } else {
      setRefreshing(true);
    }
    try {
      const [teacherData, allStats] = await Promise.all([
        getTeachers(),
        getAllTeacherStats(),
      ]);
      setTeachers(teacherData);
      const map: Record<string, TeacherStats> = {};
      for (const s of allStats) map[s.teacherId] = s;
      setStatsMap(map);
      setStatsLoaded(true);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll(false);
    const interval = setInterval(() => fetchAll(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const reload = () => fetchAll(true);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await approveTeacher(id);
      await reload();
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await rejectTeacher(id);
      await reload();
    } finally {
      setRejectingId(null);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      await deactivateTeacher(deactivateTarget.id);
      setDeactivateTarget(null);
      await reload();
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeletingTeacher(true);
    try {
      await deleteTeacher(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } finally {
      setIsDeletingTeacher(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const pendingTeachers = useMemo(() => teachers.filter((t) => t.status === "pending"), [teachers]);
  const activeTeachers = useMemo(() => teachers.filter((t) => t.status === "active"), [teachers]);
  const inactiveTeachers = useMemo(() => teachers.filter((t) => t.status === "inactive" || t.status === "rejected"), [teachers]);

  const displayedTeachers = useMemo(() => {
    const base = filter === "all" ? teachers : teachers.filter((t) => t.status === filter);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.phone ?? "").includes(q) ||
        (t.invite_code ?? "").toLowerCase().includes(q)
    );
  }, [teachers, filter, search]);

  // ── Filter tabs config ─────────────────────────────────────────────────────

  const filterTabs = [
    { id: "all" as const, label: "الكل", count: teachers.length },
    { id: "pending" as const, label: "قيد المراجعة", count: pendingTeachers.length },
    { id: "active" as const, label: "المفعّلون", count: activeTeachers.length },
    { id: "inactive" as const, label: "الموقوفون", count: inactiveTeachers.length },
  ];

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={`stat-sk-${i}`} className="h-28 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={`row-sk-${i}`} className="h-12 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-primary uppercase tracking-widest">NabTech</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">مالك المنصة</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إدارة المنصة</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">نظرة شاملة على جميع المعلمين في مكان واحد</p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-primary dark:hover:border-primary/50 transition-all disabled:opacity-60 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "جاري التحديث..." : "تحديث"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="إجمالي المعلمين"
          value={teachers.length}
          activeCls="bg-blue-500 text-white border-blue-500"
          isActive={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          label="بانتظار الموافقة"
          value={pendingTeachers.length}
          activeCls="bg-amber-500 text-white border-amber-500"
          isActive={filter === "pending"}
          onClick={() => setFilter("pending")}
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-emerald-500" />}
          label="معلمون مفعّلون"
          value={activeTeachers.length}
          activeCls="bg-emerald-500 text-white border-emerald-500"
          isActive={filter === "active"}
          onClick={() => setFilter("active")}
        />
        <StatCard
          icon={<Ban className="w-5 h-5 text-gray-500" />}
          label="موقوفون / مرفوضون"
          value={inactiveTeachers.length}
          activeCls="bg-gray-600 text-white border-gray-600"
          isActive={filter === "inactive"}
          onClick={() => setFilter("inactive")}
        />
      </div>

      {/* Pending Alert */}
      {pendingTeachers.length > 0 && filter !== "pending" && (
        <button
          onClick={() => setFilter("pending")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-all text-right animate-in slide-in-from-top-2 duration-300"
        >
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-800 dark:text-amber-300">
              {pendingTeachers.length} طلب تسجيل جديد بانتظار مراجعتك
            </p>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-500">اضغط لعرض الطلبات</p>
          </div>
          <ChevronDown className="w-4 h-4 text-amber-500 flex-shrink-0" />
        </button>
      )}

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

        {/* Table Controls Header */}
        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">إدارة المعلمين</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">
                {displayedTeachers.length} من {teachers.length} معلم
              </p>
            </div>
          </div>
          <div className="relative flex-1 max-w-xs w-full">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، البريد، الهاتف..."
              className="w-full pr-9 pl-9 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                filter === tab.id
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                filter === tab.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-gray-800">
                <th className="px-5 py-4">المعلم</th>
                <th className="px-5 py-4">البريد الإلكتروني</th>
                <th className="px-5 py-4">الهاتف</th>
                <th className="px-5 py-4">الحالة</th>
                <th className="px-5 py-4">الطلاب</th>
                <th className="px-5 py-4">المجموعات</th>
                <th className="px-5 py-4">تاريخ التسجيل</th>
                <th className="px-5 py-4 text-center">الإجراءات</th>
                <th className="px-5 py-4 text-center">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={`skel-row-${i}`} />)
              ) : displayedTeachers.length === 0 ? (
                <EmptyState filter={filter} />
              ) : (
                // FIXED: React key warning — using stable DB id, not index
                displayedTeachers.flatMap((teacher) => {
                  const tStats = statsMap[teacher.id];
                  const rows = [
                    <tr
                      key={teacher.id}
                      className={`group transition-all duration-200 ${
                        expandedId === teacher.id
                          ? "bg-gray-50/80 dark:bg-gray-800/50"
                          : "hover:bg-gray-50/60 dark:hover:bg-gray-800/30"
                      }`}
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            teacher.status === "active"
                              ? "bg-primary/10 dark:bg-primary/20 text-primary"
                              : teacher.status === "pending"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                          }`}>
                            {teacher.name.charAt(0)}
                          </div>
                          <span className={`font-black text-sm ${
                            teacher.status === "inactive" || teacher.status === "rejected"
                              ? "text-gray-400 dark:text-gray-600 line-through"
                              : "text-gray-900 dark:text-white"
                          }`}>
                            {teacher.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400" dir="ltr">
                          {teacher.email || "—"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        {teacher.phone ? (
                          <a
                            href={formatWhatsAppUrl(teacher.phone) ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/wa"
                          >
                            <span className="tabular-nums" dir="ltr">{teacher.phone}</span>
                            <MessageCircle className="w-3 h-3 text-emerald-500 opacity-0 group-hover/wa:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={teacher.status} />
                      </td>

                      {/* Students Count */}
                      <td className="px-5 py-4">
                        {!statsLoaded ? (
                          <div className="w-12 h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        ) : (
                          <CountBadge
                            icon={<Users className="w-3 h-3" />}
                            count={tStats?.studentCount ?? 0}
                            label="عدد الطلاب"
                            color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                          />
                        )}
                      </td>

                      {/* Groups Count */}
                      <td className="px-5 py-4">
                        {!statsLoaded ? (
                          <div className="w-12 h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        ) : (
                          <CountBadge
                            icon={<BookOpen className="w-3 h-3" />}
                            count={tStats?.groupCount ?? 0}
                            label="عدد المجموعات"
                            color="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
                          />
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                          <GraduationCap className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                          {formatDate(teacher.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {teacher.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(teacher.id)}
                                disabled={approvingId === teacher.id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-60"
                              >
                                {approvingId === teacher.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                قبول
                              </button>
                              <button
                                onClick={() => handleReject(teacher.id)}
                                disabled={rejectingId === teacher.id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-black text-[10px] border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white hover:border-transparent transition-all disabled:opacity-60"
                              >
                                {rejectingId === teacher.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                رفض
                              </button>
                            </>
                          )}
                          {teacher.status === "active" && (
                            <>
                              <button
                                onClick={() => setDeactivateTarget(teacher)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl font-black text-[10px] border border-amber-100 dark:border-amber-500/20 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white hover:border-transparent transition-all"
                              >
                                <Power className="w-3 h-3" /> إيقاف
                              </button>
                              <button
                                onClick={() => setDeleteTarget(teacher)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-black text-[10px] border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white hover:border-transparent transition-all"
                              >
                                <Trash2 className="w-3 h-3" /> حذف
                              </button>
                            </>
                          )}
                          {(teacher.status === "inactive" || teacher.status === "rejected") && (
                            <>
                              <button
                                onClick={() => handleApprove(teacher.id)}
                                disabled={approvingId === teacher.id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-black text-[10px] border border-blue-100 dark:border-blue-500/20 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white hover:border-transparent transition-all disabled:opacity-60"
                              >
                                {approvingId === teacher.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                إعادة تفعيل
                              </button>
                              <button
                                onClick={() => setDeleteTarget(teacher)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-black text-[10px] border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white hover:border-transparent transition-all"
                              >
                                <Trash2 className="w-3 h-3" /> حذف
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Expand Toggle */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setExpandedId(expandedId === teacher.id ? null : teacher.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all ${
                            expandedId === teacher.id
                              ? "bg-primary text-white"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary"
                          }`}
                          aria-label="عرض التفاصيل"
                        >
                          {expandedId === teacher.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>,
                  ];

                  // FIXED: Each fragment key is teacher.id + "-detail" — unique and stable
                  if (expandedId === teacher.id) {
                    rows.push(
                      <TeacherDetailPanel
                        key={`${teacher.id}-detail`}
                        teacher={teacher}
                        stats={statsMap[teacher.id]}
                      />
                    );
                  }

                  return rows;
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500">
          <span>عرض {displayedTeachers.length} من {teachers.length} معلم</span>
          {search && (
            <button onClick={() => setSearch("")} className="flex items-center gap-1 hover:text-primary transition-colors">
              <X className="w-3 h-3" /> مسح البحث
            </button>
          )}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {deactivateTarget && (
        <ConfirmModal
          title="إيقاف المدرس"
          description="هل أنت متأكد من إيقاف هذا المدرس؟ لن يتمكن من تسجيل الدخول."
          highlight={`${deactivateTarget.name} · ${deactivateTarget.email}`}
          highlightCls="bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
          iconEl={
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Power className="w-7 h-7 text-amber-500" />
            </div>
          }
          confirmLabel="إيقاف"
          confirmCls="bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98]"
          onConfirm={handleDeactivateConfirm}
          onCancel={() => setDeactivateTarget(null)}
          isLoading={isDeactivating}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="حذف المدرس نهائياً"
          description="لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع البيانات المرتبطة."
          highlight={`${deleteTarget.name} · ${deleteTarget.email}`}
          highlightCls="bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400"
          iconEl={
            <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
          }
          confirmLabel="حذف نهائي"
          confirmCls="bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeletingTeacher}
        />
      )}
    </div>
  );
}
