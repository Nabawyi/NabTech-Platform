"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink, ShieldCheck, MessageCircle, Trash2, AlertTriangle, Users, CheckCircle, XCircle, UserCheck, Clock, Loader2 } from "lucide-react";
import { getLocations } from "@/app/actions/locations";
import { getSubscriptions } from "@/app/actions/subscriptions";
import { updateStudentGroup, deleteStudent, approveStudent, rejectStudent, deleteAllStudents, getStudents } from "@/app/actions/students";
import { EDUCATION_LEVELS, SchoolLevel } from "@/lib/constants";
import { filterStudents, getValidGrades } from "@/lib/education";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { GroupRecord, LocationRecord, SubscriptionRow, StudentRow } from "@/types/domain";
import Link from "next/link";

// Helper to format phone for WhatsApp
const formatWhatsAppUrl = (phone: string) => {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, '');
  const formatted = clean.startsWith('0') ? '2' + clean : clean.startsWith('20') ? clean : '20' + clean;
  return `https://wa.me/${formatted}`;
};

const WhatsAppLink = ({ phone, className = "" }: { phone: string; className?: string }) => {
  const url = formatWhatsAppUrl(phone);
  if (!url) return <span className="text-gray-300 dark:text-gray-600">لا يوجد رقم</span>;
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-1.5 hover:text-emerald-600 transition-colors group/wa ${className}`}
    >
      <span className="tabular-nums">{phone}</span>
      <div className="p-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-md group-hover/wa:bg-emerald-500 group-hover/wa:text-white transition-all">
        <MessageCircle className="w-3 h-3" />
      </div>
    </a>
  );
};

export default function StudentsPage() {
  const { settings, enabledLevels, getEnabledGradesForLevel } = useSettings();
  const teacherId = settings.id;

  const [data, setData] = useState<SubscriptionRow[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [locationFilter, setLocationFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  
  const [changeGroupStudent, setChangeGroupStudent] = useState<SubscriptionRow | null>(null);
  const [cgLocation, setCgLocation] = useState('');
  const [cgGroup, setCgGroup] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pending students state
  const [pendingStudents, setPendingStudents] = useState<Record<string, unknown>[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Bulk delete state
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [lData, subData, allStudents] = await Promise.all([
        getLocations(teacherId),
        getSubscriptions(teacherId),
        getStudents(teacherId),
      ]);
      
      // Data-level filter by teacher settings
      const settingsFiltered = subData.filter((s) => {
        const st = String(s.stage ?? s.level ?? "");
        const gr = Number(s.grade ?? s.gradeNumber ?? 0);
        if (!enabledLevels.some(l => l.id === st)) return false;
        return getEnabledGradesForLevel(st as SchoolLevel).includes(gr);
      });

      // Get pending students separately (they are not in subscriptions view)
      const pending = allStudents.filter((s: Record<string, unknown>) => s.status === "pending");
      setPendingStudents(pending);

      setLocations(lData);
      setData(settingsFiltered);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (levelFilter === "all") return;
    const valid = getValidGrades(levelFilter as SchoolLevel);
    setGradeFilter((prev) => {
      if (prev === "all") return prev;
      return valid.includes(Number(prev)) ? prev : "all";
    });
  }, [levelFilter]);

  const handleChangeGroupSave = async () => {
    if (!changeGroupStudent || !cgLocation || !cgGroup) return;
    await updateStudentGroup(changeGroupStudent.id, cgLocation, cgGroup);
    setChangeGroupStudent(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteStudent(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        loadData();
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Approve a pending student → status becomes "active"
  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await approveStudent(id);
      loadData();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setApprovingId(null);
    }
  };

  // Reject a pending student
  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await rejectStudent(id);
      loadData();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setRejectingId(null);
    }
  };

  // Bulk delete ALL students
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await deleteAllStudents(teacherId);
      setShowBulkDelete(false);
      loadData();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getFilteredStudents = () => {
    // First, pre-filter to only enabled stages/grades from settings
    const enabledLevelIds = enabledLevels.map((l) => l.id);
    const settingsFiltered = data.filter((s) => {
      const st = String(s.stage ?? s.level ?? "");
      const gr = Number(s.grade ?? s.gradeNumber ?? 0);
      if (!st || !enabledLevelIds.includes(st as SchoolLevel)) return false;
      const enabledGrades = getEnabledGradesForLevel(st);
      return enabledGrades.includes(gr);
    });

    const stageParam = levelFilter === "all" ? "all" : (levelFilter as SchoolLevel);
    const gradeParam =
      gradeFilter === "all" ? "all" : Number(gradeFilter);
    const byStageGrade = filterStudents(settingsFiltered as Record<string, unknown>[], {
      stage: stageParam,
      gradeCode: gradeFilter,
    }) as SubscriptionRow[];

    return byStageGrade.filter((s) => {
      const nm = String(s.name ?? "");
      const ph = String(s.phone ?? "");
      const matchesSearch =
        nm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ph.includes(searchTerm) ||
        String(s.id).includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || s.calculatedStatus === statusFilter;
      const matchesLocation =
        locationFilter === "all" || s.locationId === locationFilter;
      const matchesGroup =
        groupFilter === "all" || s.groupId === groupFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation &&
        matchesGroup
      );
    });
  };

  // Grade options from actual data
  const gradeOptions = Array.from(new Map(
    data.map(s => [s.gradeCode, s.gradeLabel || `صف ${s.gradeNumber}`])
  )).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const filtered = getFilteredStudents();
  
  const getLocationName = (grpId: unknown) => {
    for (const loc of locations) {
      if (loc.groups.some(g => g.id === String(grpId ?? ""))) return loc.name;
    }
    return "غير محدد";
  };
  
  const getGroupName = (grpId: unknown) => {
    for (const loc of locations) {
      const g = loc.groups.find((g: GroupRecord) => g.id === String(grpId ?? ""));
      if (g) return g.name;
    }
    return "غير محدد";
  };

  const getLevelName = (levelId: unknown) =>
    EDUCATION_LEVELS.find((l) => l.id === String(levelId ?? ""))?.nameAr || "---";

  if (enabledLevels.length === 0 && !loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-6 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
          <Users className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 mb-2">لم يتم تفعيل أي صفوف بعد</h2>
          <p className="text-gray-400 dark:text-gray-500 font-medium">يرجى تفعيل المراحل والصفوف من صفحة الإعدادات لتتمكن من إدارة طلابك</p>
        </div>
        <Link href="/teacher/settings" className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          الذهاب للإعدادات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">إدارة الطلاب</h1>
          <p className="text-gray-400 dark:text-gray-500 font-medium tracking-wide">عرض بيانات الطلاب ومتابعة حالات الاشتراك</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBulkDelete(true)}
            className="px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-xs hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-800"
          >
            <Trash2 className="w-4 h-4 inline ml-1" />
            حذف جميع الطلاب
          </button>
          <div className="bg-primary/5 dark:bg-primary/10 px-6 py-3 rounded-2xl border border-primary/10 dark:border-primary/20">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">إجمالي الطلاب</p>
            <p className="text-2xl font-black text-primary">{data.length}</p>
          </div>
        </div>
      </div>

      {/* ═══════ Pending Students Section ═══════ */}
      {pendingStudents.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] shadow-sm border border-amber-200 dark:border-amber-800 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-800 dark:text-amber-300">طلاب بانتظار الموافقة</h2>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-500">{pendingStudents.length} طالب بانتظار المراجعة</p>
            </div>
          </div>

          <div className="space-y-2">
            {pendingStudents.map((student) => (
              <div
                key={String(student.id)}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-amber-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                    {String(student.name ?? "?").charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-gray-100 text-sm">{String(student.name ?? "")}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                      {String(student.phone ?? "")} • الكود: {String(student.id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(String(student.id))}
                    disabled={approvingId === String(student.id)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {approvingId === String(student.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    قبول وتفعيل
                  </button>
                  <button
                    onClick={() => handleReject(String(student.id))}
                    disabled={rejectingId === String(student.id)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-black text-xs border border-red-200 dark:border-red-800 hover:bg-red-500 hover:text-white hover:border-transparent transition-all disabled:opacity-60"
                  >
                    {rejectingId === String(student.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
4          <div className="flex flex-wrap items-center bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl gap-1">
            <button onClick={() => { setLevelFilter('all'); setGradeFilter('all'); }} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${levelFilter === 'all' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>الكل</button>
            {enabledLevels.map(l => (
              <button 
                key={l.id}
                onClick={() => { setLevelFilter(l.id); setGradeFilter('all'); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${levelFilter === l.id ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                {l.nameAr}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="relative w-full sm:w-64">
               <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="ابحث بالاسم أو الكود..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-4 pr-11 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm dark:text-gray-100 dark:placeholder:text-gray-500"
               />
             </div>
             
             <div className="flex flex-wrap gap-2">
                <select 
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent outline-none font-bold text-xs text-gray-500 dark:text-gray-300"
                >
                  <option value="all">كل الصفوف</option>
                  {gradeOptions.map(([code, label]) => (
                    <option key={String(code)} value={String(code)}>{String(label)}</option>
                  ))}
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent outline-none font-bold text-xs text-gray-500 dark:text-gray-300"
                >
                  <option value="all">كل الاشتراكات</option>
                  <option value="active">نشط</option>
                  <option value="expiring_soon">قرب الانتهاء</option>
                  <option value="expired">منتهي</option>
                  <option value="inactive">غير مفعل</option>
                </select>

                <select 
                  value={locationFilter}
                  onChange={(e) => { setLocationFilter(e.target.value); setGroupFilter('all'); }}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent outline-none font-bold text-xs text-gray-500 dark:text-gray-300"
                >
                  <option value="all">المكان</option>
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-3xl border border-gray-50 dark:border-gray-700">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700/50 text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 dark:border-gray-700">
                <th className="px-6 py-5">الكود</th>
                <th className="px-6 py-5">الطالب</th>
                <th className="px-6 py-5">المرحلة / الصف</th>
                <th className="px-6 py-5">المجموعة</th>
                <th className="px-6 py-5">التواصل</th>
                <th className="px-6 py-5">حالة الاشتراك</th>
                <th className="px-6 py-5">تاريخ الانتهاء</th>
                <th className="px-6 py-5 text-center">إدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-bold">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-bold">
                    لا يوجد طلاب مطابقون للفلاتر
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                const status = student.calculatedStatus;
                return (
                  <tr key={student.id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-all duration-300">
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg font-black text-xs tabular-nums">
                        {student.code || student.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                          {String(student.name ?? "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-gray-100 text-sm mb-0.5">{String(student.name ?? "")}</p>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{getLevelName(student.stage ?? student.level)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-black text-slate-600 dark:text-gray-300">{getLevelName(student.stage ?? student.level)}</p>
                       <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">الصف {String(student.grade ?? student.gradeNumber ?? "")}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-slate-800 dark:text-gray-100">
                        {student.groupName || "بدون مجموعة"}
                      </p>
                      <button onClick={() => setChangeGroupStudent(student)} className="text-[9px] font-black text-primary hover:underline mt-1 block">تغيير</button>
                    </td>
                    <td className="px-6 py-5 space-y-2">
                       <WhatsAppLink phone={String(student.phone ?? "")} className="text-xs font-bold text-slate-600 dark:text-gray-300" />
                       <div className="flex items-center gap-1">
                         <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase mr-1">Parent:</span>
                         <WhatsAppLink phone={String(student.parentPhone ?? "")} className="text-[10px] font-bold text-gray-400 dark:text-gray-500" />
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] ${
                        status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        status === 'expiring_soon' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                        'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {status === 'active' ? 'نشط' : status === 'expiring_soon' ? 'قرب الانتهاء' : status === 'expired' ? 'منتهي' : 'غير مفعل'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                        {student.subscription?.endDate ? new Date(student.subscription.endDate).toLocaleDateString('ar-EG') : '---'}
                      </span>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-1">{student.daysRemaining} يوم متبقي</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/teacher/subscriptions?studentId=${student.id}`}
                          className="p-2 bg-primary/5 dark:bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all inline-flex shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all inline-flex shadow-sm"
                          title="حذف الطالب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Change Modal */}
      {changeGroupStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
             <h3 className="text-xl font-black mb-6 dark:text-gray-100">تغيير مجموعة {String(changeGroupStudent.name ?? "")}</h3>
             <div className="space-y-4 mb-8">
               <select value={cgLocation} onChange={e => setCgLocation(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none font-bold outline-none ring-1 ring-gray-100 dark:ring-gray-600 dark:text-gray-100">
                 <option value="">اختر السنتر</option>
                 {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
               </select>
               <select value={cgGroup} onChange={e => setCgGroup(e.target.value)} disabled={!cgLocation} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none font-bold outline-none ring-1 ring-gray-100 dark:ring-gray-600 disabled:opacity-50 dark:text-gray-100">
                 <option value="">اختر المجموعة</option>
                 {locations.find((l) => l.id === cgLocation)?.groups.map((grp: GroupRecord) => (
                   <option key={grp.id} value={grp.id}>{grp.name}</option>
                 ))}
               </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setChangeGroupStudent(null)} className="py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">إلغاء</button>
               <button onClick={handleChangeGroupSave} className="py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">حفظ التغييرات</button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-gray-100 mb-3">حذف الطالب</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء
              </p>
              <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 w-full">
                <p className="text-sm font-black text-red-700 dark:text-red-400">
                  {String(deleteTarget.name ?? "")}
                </p>
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400/70 mt-1">
                  الكود: {deleteTarget.id} • سيتم حذف الحضور والاشتراكات المرتبطة
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeleteTarget(null)} 
                disabled={isDeleting}
                className="py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>حذف نهائي</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete All Students Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-gray-100 mb-3">حذف جميع الطلاب</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                سيتم حذف <span className="text-red-600 font-black">جميع الطلاب</span> وبياناتهم المرتبطة (الحضور والاشتراكات ونتائج الاختبارات). لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowBulkDelete(false)}
                disabled={isBulkDeleting}
                className="py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الكل</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
