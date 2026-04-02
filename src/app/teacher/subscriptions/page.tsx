"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSettings } from "@/components/providers/SettingsProvider";
import { 
  getSubscriptions, 
  activateSubscription, 
  renewSubscription, 
  deactivateSubscription,
} from "@/app/actions/subscriptions";
import StatusBadge from "@/components/teacher/StatusBadge";
import { EDUCATION_LEVELS, type SchoolLevel } from "@/lib/constants";
import { filterStudents, getValidGrades } from "@/lib/education";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  RefreshCcw, 
  Loader2, 
  AlertCircle,
  CreditCard,
} from "lucide-react";
import type { SubscriptionRow } from "@/types/domain";

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get("studentId");

  const { settings, enabledLevels, getEnabledGradesForLevel } = useSettings();
  const [data, setData] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<"all" | SchoolLevel>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    studentId: number | null;
    studentName: string;
    action: "activate" | "renew" | "deactivate" | null;
  }>({ show: false, studentId: null, studentName: "", action: null });

  const [actioning, setActioning] = useState(false);

  // 1. Fetch only if we have enabled levels
  const fetchData = async () => {
    if (enabledLevels.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getSubscriptions();
    
    // 2. Filter data at source: only students in enabled levels AND grades
    const globalFiltered = result.filter(student => {
      const stage = (student.level as string) || "";
      const grade = student.gradeNumber || 0;
      return settings.enabled_levels.includes(stage as any) && settings.enabled_grades.includes(grade);
    });

    setData(globalFiltered);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [settings.enabled_levels, settings.enabled_grades]);
  useEffect(() => { if (studentIdParam) setSearch(studentIdParam); }, [studentIdParam]);

  useEffect(() => {
    if (stageFilter === "all") return;
    const valid = getEnabledGradesForLevel(stageFilter);
    setGradeFilter((prev) => (prev === "all" || valid.includes(Number(prev))) ? prev : "all");
  }, [stageFilter, getEnabledGradesForLevel]);

  const handleAction = async () => {
    if (!confirmModal.studentId || !confirmModal.action) return;
    setActioning(true);
    try {
      if (confirmModal.action === "activate")   await activateSubscription(confirmModal.studentId);
      if (confirmModal.action === "renew")      await renewSubscription(confirmModal.studentId);
      if (confirmModal.action === "deactivate") await deactivateSubscription(confirmModal.studentId);
      setConfirmModal({ show: false, studentId: null, studentName: "", action: null });
      fetchData();
    } finally {
      setActioning(false);
    }
  };

  // The local filtered data (UI level)
  const filteredData = data.filter((s) => {
    const nm = String(s.name ?? "");
    const matchesSearch = nm.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search);
    const matchesStatus = statusFilter === "all" || s.calculatedStatus === statusFilter;
    const matchesStage = stageFilter === "all" || s.level === stageFilter;
    const matchesGrade = gradeFilter === "all" || s.gradeNumber === Number(gradeFilter);
    
    return matchesSearch && matchesStatus && matchesStage && matchesGrade;
  });

  // Level options only from settings
  const levelOptions = enabledLevels;

  // Grade options only from settings for selected level
  const gradeOptions = stageFilter === "all" 
    ? settings.enabled_grades 
    : getEnabledGradesForLevel(stageFilter);

  if (enabledLevels.length === 0) {
    return (
      <div className="py-20 text-center bg-card border border-card-border rounded-3xl">
        <AlertCircle className="w-16 h-16 text-primary/30 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-foreground">لم يتم تفعيل أي صفوف بعد</h2>
        <p className="text-muted-fg mt-2 font-medium">يرجى تفعيل المراحل والصفوف من صفحة الإعدادات للمتابعة</p>
      </div>
    );
  }

  const activeCount     = data.filter(s => s.calculatedStatus === "active" || s.calculatedStatus === "expiring_soon").length;
  const expiringSoon    = data.filter(s => s.calculatedStatus === "expiring_soon").length;
  const expiredCount    = data.filter(s => s.calculatedStatus === "expired").length;
  const inactiveCount   = data.filter(s => s.calculatedStatus === "inactive").length;

  const ACTION_LABELS = {
    activate:   "تفعيل اشتراك جديد",
    renew:      "تجديد اشتراك",
    deactivate: "إلغاء اشتراك",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-card border border-card-border rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">إدارة الاشتراكات</h1>
            <p className="text-muted-fg text-sm mt-0.5">متابعة تحصيل المصروفات وتفعيل حسابات الطلاب</p>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="flex flex-wrap gap-3">
          <Metric value={activeCount}   label="نشط"           color="text-success-fg" bg="bg-success border-success" />
          <Metric value={expiringSoon}  label="ينتهي قريباً"  color="text-warning-fg" bg="bg-warning border-warning" />
          <Metric value={expiredCount}  label="منتهي"         color="text-danger-fg"  bg="bg-danger border-danger"  />
          <Metric value={inactiveCount} label="غير مفعل"      color="text-muted-fg"   bg="bg-muted border-card-border" />
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-4 pr-11 py-3.5 rounded-2xl
              bg-card border border-card-border
              text-foreground placeholder:text-muted-fg
              font-bold text-sm outline-none
              focus:border-primary focus:ring-4 focus:ring-primary/10
              transition-all
            "
          />
        </div>

        <FilterSelect value={stageFilter} onChange={(v) => { setStageFilter(v === "all" ? "all" : v as SchoolLevel); setGradeFilter("all"); }}>
          <option value="all">كل المراحل</option>
          {levelOptions.map((l: any) => <option key={l.id} value={l.id}>{l.nameAr}</option>)}
        </FilterSelect>

        <FilterSelect value={gradeFilter} onChange={setGradeFilter}>
          <option value="all">كل الصفوف</option>
          {gradeOptions.map((n: number) => <option key={n} value={String(n)}>صف {n}</option>)}
        </FilterSelect>


        <FilterSelect value={statusFilter} onChange={setStatusFilter}>
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="expiring_soon">ينتهي قريباً</option>
          <option value="expired">منتهي</option>
          <option value="inactive">غير مفعل</option>
        </FilterSelect>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="bg-card border border-card-border rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-fg font-bold">جاري تحميل البيانات...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-fg font-bold">لا توجد سجلات مطابقة للفلاتر</p>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead>
              <tr className="bg-muted border-b border-card-border text-[10px] font-black text-muted-fg uppercase tracking-widest">
                <th className="px-6 py-4">الطالب</th>
                <th className="px-4 py-4">المرحلة</th>
                <th className="px-4 py-4">الحالة</th>
                <th className="px-4 py-4">تاريخ الانتهاء</th>
                <th className="px-4 py-4">المتبقي</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredData.map((student) => {
                const days = student.daysRemaining ?? 0;
                const endDate = student.subscription?.endDate
                  ? new Date(student.subscription.endDate).toLocaleDateString("ar-EG")
                  : "---";

                return (
                  <tr
                    key={student.id}
                    className="group hover:bg-muted transition-colors"
                  >
                    {/* Name + ID */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center flex-shrink-0">
                          {String(student.name ?? "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-sm">{String(student.name ?? "")}</p>
                          <p className="text-[10px] font-bold text-muted-fg mt-0.5">كود: {student.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-5">
                      <p className="text-xs font-bold text-foreground">
                        {typeof student.gradeLabel === "string" && student.gradeLabel
                          ? student.gradeLabel
                          : `صف ${String(student.gradeNumber ?? student.grade ?? "")}`}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-5">
                      <StatusBadge status={student.calculatedStatus} />
                    </td>

                    {/* End date */}
                    <td className="px-4 py-5">
                      <span className="text-sm font-bold text-foreground tabular-nums">{endDate}</span>
                    </td>

                    {/* Days remaining + mini bar */}
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-sm font-black tabular-nums ${
                          days <= 0   ? "text-danger-fg" :
                          days <= 7   ? "text-warning-fg" :
                                        "text-success-fg"
                        }`}>
                          {days > 0 ? `${days} يوم` : "منتهي"}
                        </span>
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden border border-card-border">
                          <div
                            className={`h-full rounded-full transition-all ${
                              days <= 0 ? "bg-danger-fg" :
                              days <= 7 ? "bg-warning-fg" :
                                          "bg-success-fg"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, (days / 30) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {(student.calculatedStatus === "inactive" || student.calculatedStatus === "expired") && (
                          <ActionBtn
                            onClick={() => setConfirmModal({ show: true, studentId: student.id, studentName: String(student.name ?? ""), action: "activate" })}
                            title="تفعيل"
                            className="bg-success text-success-fg hover:bg-success-fg hover:text-card"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </ActionBtn>
                        )}
                        {(student.calculatedStatus === "active" || student.calculatedStatus === "expiring_soon") && (
                          <>
                            <ActionBtn
                              onClick={() => setConfirmModal({ show: true, studentId: student.id, studentName: String(student.name ?? ""), action: "renew" })}
                              title="تجديد"
                              className="bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </ActionBtn>
                            <ActionBtn
                              onClick={() => setConfirmModal({ show: true, studentId: student.id, studentName: String(student.name ?? ""), action: "deactivate" })}
                              title="إلغاء"
                              className="bg-danger text-danger-fg hover:bg-danger-fg hover:text-card"
                            >
                              <XCircle className="w-4 h-4" />
                            </ActionBtn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Confirmation Modal ──────────────────────────────── */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-card-border rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
              confirmModal.action === "deactivate"
                ? "bg-danger text-danger-fg"
                : "bg-success text-success-fg"
            }`}>
              {confirmModal.action === "deactivate"
                ? <AlertCircle className="w-8 h-8" />
                : <CheckCircle className="w-8 h-8" />
              }
            </div>

            <h3 className="text-xl font-black text-center text-foreground mb-2">تأكيد الإجراء</h3>
            <p className="text-muted-fg text-sm text-center leading-relaxed mb-8">
              هل أنت متأكد من {ACTION_LABELS[confirmModal.action!]} للطالب{" "}
              <span className="font-black text-foreground">«{confirmModal.studentName}»</span>؟
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="py-3.5 bg-muted text-muted-fg rounded-2xl font-black hover:bg-card-border transition-all"
              >
                تراجع
              </button>
              <button
                onClick={handleAction}
                disabled={actioning}
                className={`
                  py-3.5 text-white rounded-2xl font-black shadow-lg transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2
                  ${confirmModal.action === "deactivate" ? "bg-danger-fg" : "bg-success-fg"}
                `}
              >
                {actioning && <Loader2 className="w-4 h-4 animate-spin" />}
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small reusable sub-components ────────────────────────── */

function Metric({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <div className={`px-5 py-3 rounded-2xl border text-center ${bg}`}>
      <p className={`text-2xl font-black ${color} tabular-nums`}>{value}</p>
      <p className={`text-[10px] font-black uppercase tracking-wide ${color} opacity-80`}>{label}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, children }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full px-4 py-3.5 rounded-2xl
        bg-card border border-card-border
        text-foreground font-bold text-sm outline-none
        focus:border-primary focus:ring-4 focus:ring-primary/10
        transition-all cursor-pointer
      "
    >
      {children}
    </select>
  );
}

function ActionBtn({ onClick, title, className, children }: {
  onClick: () => void;
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-xl transition-all shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Page export with Suspense ─────────────────────────────── */
export default function TeacherSubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-fg font-bold">جاري تحميل الصفحة...</p>
      </div>
    }>
      <SubscriptionsContent />
    </Suspense>
  );
}
