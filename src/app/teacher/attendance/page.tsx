"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, UserCheck, UserX, Info, ListFilter, ClipboardList, AlertCircle } from "lucide-react";
import { getActiveStudents } from "@/app/actions/subscriptions";
import { markAttendance, getAttendanceByDate, bulkMarkAttendance } from "@/app/actions/attendance";
import { getLocations } from "@/app/actions/locations";
import { EDUCATION_LEVELS, type SchoolLevel } from "@/lib/constants";
import { filterStudents, getValidGrades } from "@/lib/education";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { AttendanceRecord, GroupRecord, LocationRecord, SubscriptionRow } from "@/types/domain";

export default function AttendancePage() {
  const { settings, enabledLevels, getEnabledGradesForLevel } = useSettings();
  const teacherId = settings.id; // Correct scoping key
  
  const [students, setStudents] = useState<SubscriptionRow[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState<'all' | SchoolLevel>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [saving, setSaving] = useState<string | null>(null);
  
  // Bulk Mode States
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');
  const [bulkIds, setBulkIds] = useState("");
  const [bulkResult, setBulkResult] = useState<{ present: number, invalid: string[] } | null>(null);

  const loadData = async () => {
    try {
      const [activeStudents, dayAttendance, allLocations] = await Promise.all([
        getActiveStudents(),
        getAttendanceByDate(date),
        getLocations(teacherId) // Pass teacherId for filtering
      ]);
      setStudents(activeStudents);
      setAttendance(dayAttendance);
      setLocations(allLocations);
    } catch {
      console.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!date) {
      setDate(new Date().toISOString().split('T')[0]);
      return;
    }
    loadData();
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps -- refetch when date changes only

  useEffect(() => {
    if (stageFilter === "all") return;
    const valid = getValidGrades(stageFilter);
    setGradeFilter((prev) => {
      if (prev === "all") return prev;
      return valid.includes(Number(prev)) ? prev : "all";
    });
  }, [stageFilter]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    setSaving(studentId);
    try {
      await markAttendance(studentId, date, status, teacherId);
      setAttendance((prev) => {
        const existing = prev.findIndex((r) => r.studentId === studentId);
        if (existing > -1) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], status };
          return updated;
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            studentId,
            teacherId,
            date,
            status,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    } catch {
      alert("خطأ في تسجيل الحضور");
    } finally {
      setSaving(null);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkIds.trim()) return;
    setLoading(true);
    try {
      const ids = bulkIds.split(/[\n, ]+/).map(id => id.trim()).filter(id => id.length > 0);
      const res = await bulkMarkAttendance(ids, date, teacherId);
      setBulkResult({ present: res.present, invalid: res.invalid });
      await loadData();
      setBulkIds("");
    } catch {
      alert("خطأ في التسجيل الجماعي");
    } finally {
      setLoading(false);
    }
  };

  const getStudentStatus = (studentId: string) => {
    return attendance.find(r => r.studentId === studentId)?.status;
  };

  // Pre-filter students by settings (enabled levels + grades)
  const enabledLevelIds = enabledLevels.map((l) => l.id);
  const settingsFilteredStudents = students.filter((s) => {
    const st = String(s.stage ?? s.level ?? "");
    const gr = Number(s.grade ?? s.gradeNumber ?? 0);
    if (!st || !enabledLevelIds.includes(st as SchoolLevel)) return false;
    const enabledGrades = getEnabledGradesForLevel(st);
    return enabledGrades.includes(gr);
  });

  const byStageGrade = filterStudents(settingsFilteredStudents as Record<string, unknown>[], {
    stage: stageFilter,
    gradeCode: gradeFilter,
  }) as SubscriptionRow[];

  const filteredStudents = byStageGrade.filter((s) => {
    const name = String(s.name ?? "");
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation =
      locationFilter === "all" || s.locationId === locationFilter;
    const matchesGroup =
      groupFilter === "all" || s.groupId === groupFilter;

    return matchesSearch && matchesLocation && matchesGroup;
  });

  // Grade options from actual student data based on selected level
  const gradeOptions = Array.from(new Map(
    students
      .filter(s => stageFilter === "all" || s.stage === stageFilter)
      .map(s => [s.gradeCode, s.gradeLabel || `صف ${s.grade}`])
  )).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground mb-0.5">سجل الحضور الذكي</h1>
            <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">إدارة الحضور بالباركود أو الإدخال اليدوي</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setMode('individual')}
            className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${mode === 'individual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            <ListFilter className="w-4 h-4" /> فردي
          </button>
          <button 
            onClick={() => setMode('bulk')}
            className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${mode === 'bulk' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            <ClipboardList className="w-4 h-4" /> جماعي / باركود
          </button>
          <div className="h-10 w-px bg-gray-100 dark:bg-gray-700 mx-2 hidden sm:block" />
          <div className="relative">
            <Calendar className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {mode === 'bulk' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
          {/* Bulk Input */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" /> إدخال كود الطالب
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-bold leading-relaxed">
              قم بلصق أكواد الطلاب هنا مباشرة (باركود أو يدوي). تأكد من وضع كل كود في سطر منفصل.
            </p>
            <textarea 
              value={bulkIds}
              onChange={(e) => setBulkIds(e.target.value)}
              placeholder={"مثال:\n3001\n3042\n2011"}
              className="w-full h-64 p-6 bg-slate-50 dark:bg-gray-700 rounded-3xl border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-mono text-lg text-primary dark:text-primary placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none"
            />
            <button 
              onClick={handleBulkSubmit}
              disabled={loading || !bulkIds.trim()}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:grayscale disabled:opacity-50"
            >
              تسجيل الحضور الآن
            </button>
          </div>

          {/* Bulk Results */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
            {bulkResult ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-lg font-black text-foreground">ملخص العملية</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{bulkResult.present}</p>
                    <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">طلاب حاضرين</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-800">
                    <p className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">{bulkResult.invalid.length}</p>
                    <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase">أكواد غير صحيحة</p>
                  </div>
                </div>

                {bulkResult.invalid.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> قائمة الأكواد الخاطئة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bulkResult.invalid.map((id, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-black">{id}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">سيتم تسجيل باقي الطلاب المسجلين في هذا اليوم كـ «غائبين» تلقائياً.</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                <Info className="w-16 h-16 mb-4" />
                <p className="font-bold text-lg">بانتظار الإدخال</p>
                <p className="text-sm">نتائج التسجيل الجماعي ستظهر هنا فور الانتهاء</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Individual Marking Table */
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-gray-100">قائمة الطلاب المعتمدين</h2>
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative w-full md:w-64">
                 <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                  type="text" 
                  placeholder="بحث بالكود أو الاسم..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary transition-all outline-none text-xs font-bold shadow-sm dark:text-gray-100 dark:placeholder:text-gray-500"
                 />
               </div>

               <select 
                 value={stageFilter}
                 onChange={(e) => {
                   const v = e.target.value;
                   setStageFilter(v === "all" ? "all" : (v as SchoolLevel));
                   setGradeFilter("all");
                 }}
                 className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-xs text-gray-500 dark:text-gray-300 cursor-pointer shadow-sm"
               >
                 <option value="all">كل المراحل</option>
                 {enabledLevels.map((lvl) => (
                   <option key={lvl.id} value={lvl.id}>{lvl.nameAr}</option>
                 ))}
               </select>

                <select 
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-xs text-gray-500 dark:text-gray-300 cursor-pointer shadow-sm"
                >
                  <option value="all">كل الصفوف</option>
                  {gradeOptions.map(([code, label]) => (
                    <option key={String(code)} value={String(code)}>{String(label)}</option>
                  ))}
                </select>

               <select 
                 value={locationFilter}
                 onChange={(e) => {
                   setLocationFilter(e.target.value);
                   setGroupFilter('all');
                 }}
                 className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-xs text-gray-500 dark:text-gray-300 cursor-pointer shadow-sm"
               >
                 <option value="all">كل السناتر</option>
                 {locations.map(loc => (
                   <option key={loc.id} value={loc.id}>{loc.name}</option>
                 ))}
               </select>

               <select 
                 value={groupFilter}
                 onChange={(e) => setGroupFilter(e.target.value)}
                 disabled={locationFilter === 'all'}
                 className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border-transparent focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-xs text-gray-500 dark:text-gray-300 cursor-pointer shadow-sm disabled:opacity-50"
               >
                 <option value="all">كل المجموعات</option>
                 {locations.find((l) => l.id === locationFilter)?.groups
                   .filter((grp: GroupRecord) => {
                     const stageMatch = stageFilter === 'all' || grp.stage === stageFilter;
                     const gradeMatch = gradeFilter === 'all' || grp.grade === Number(gradeFilter);
                     return stageMatch && gradeMatch;
                   })
                   .map((grp: GroupRecord) => (
                   <option key={grp.id} value={grp.id}>{grp.name}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/50 dark:bg-gray-700/50 text-slate-500 dark:text-gray-500 font-black text-[10px] uppercase tracking-widest border-b border-gray-50 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-5">كود الطالب</th>
                  <th className="px-6 py-5">اسم الطالب</th>
                  <th className="px-6 py-5">المجموعة</th>
                  <th className="px-6 py-5 text-center">الحالة</th>
                  <th className="px-6 py-5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filteredStudents.length === 0 && !loading && (
                   <tr><td colSpan={5} className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold italic opacity-30">لا يوجد طلاب مطابقين للبحث</td></tr>
                )}
                {filteredStudents.map((student) => {
                  const currentStatus = getStudentStatus(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-all">
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg font-black text-xs tabular-nums">{student.code || student.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-800 dark:text-gray-100 text-base">{student.name}</td>
                      <td className="px-6 py-5 text-slate-600 dark:text-gray-400 text-sm font-bold whitespace-nowrap">
                        {student.groupName || 'بدون مجموعة'}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {!currentStatus ? (
                          <span className="text-gray-300 dark:text-gray-600 font-bold text-xs">بانتظار التحضير</span>
                        ) : currentStatus === 'present' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black text-xs">حاضر</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-black text-xs">غائب</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleMarkAttendance(student.id, 'present')}
                            disabled={saving === student.id}
                            className={`p-2.5 rounded-xl transition-all ${currentStatus === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(student.id, 'absent')}
                            disabled={saving === student.id}
                            className={`p-2.5 rounded-xl transition-all ${currentStatus === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/50' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'}`}
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
