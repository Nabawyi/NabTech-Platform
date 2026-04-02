"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, MapPin, Users, Clock, X, AlertTriangle } from "lucide-react";
import { 
  getLocations, addLocation, updateLocation, deleteLocation, 
  addGroup, updateGroup, deleteGroup, getGroupStudentCounts 
} from "@/app/actions/locations";
import type { GroupRecord, LocationRecord } from "@/types/domain";
import { EDUCATION_LEVELS, type SchoolLevel, getGradeLabel } from "@/lib/constants";
import { getValidGrades } from "@/lib/education";
import { formatTimeTo12Hour, toTimeOptions } from "@/lib/time";
import { useSettings } from "@/components/providers/SettingsProvider";

type EditingGroup = GroupRecord & { locId: string };

export default function GroupsPage() {
  const { settings, enabledLevels, getEnabledGradesForLevel } = useSettings();
  const teacherId = settings.id;
  
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string,number>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modals / Forms state
  const [editingLoc, setEditingLoc] = useState<LocationRecord | null>(null);
  const [addingLoc, setAddingLoc] = useState(false);
  const [addingGrp, setAddingGrp] = useState<string | null>(null);
  const [editingGrp, setEditingGrp] = useState<EditingGroup | null>(null);
  const [groupStage, setGroupStage] = useState<SchoolLevel | "">("");
  const [groupGrade, setGroupGrade] = useState<number | "">("");
  const [groupStartTime, setGroupStartTime] = useState<string>("");
  const [groupEndTime, setGroupEndTime] = useState<string>("");

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      const [data, counts] = await Promise.all([getLocations(teacherId), getGroupStudentCounts(teacherId)]);
      
      // Filter locations to only show those that have at least one enabled group, 
      // AND filter the groups list in each location to only show enabled ones.
      const filtered = data.map(loc => ({
        ...loc,
        groups: loc.groups.filter(grp => {
          const st = grp.stage as string || (grp as any).level as string || "";
          const gr = grp.grade || 0;
          return enabledLevels.some(l => l.id === st) && getEnabledGradesForLevel(st).includes(gr);
        })
      })).filter(loc => loc.groups.length > 0 || enabledLevels.length > 0); 
      // Note: we keep locations even if empty if any levels are enabled, so they can add groups.
      // But we filter the groups THEMSELVES at data level.

      setLocations(filtered);
      setStudentCounts(counts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  useEffect(() => {
    // When opening the group modal, initialize stage/grade/time selectors.
    if (editingGrp) {
      const rawStage = (editingGrp.stage ??
        (editingGrp as unknown as { level?: unknown }).level ??
        "") as unknown;
      const stage =
        rawStage === "primary" || rawStage === "preparatory" || rawStage === "secondary"
          ? rawStage
          : "";
      setGroupStage(stage as SchoolLevel | "");
      setGroupGrade(typeof editingGrp.grade === "number" ? editingGrp.grade : "");
      setGroupStartTime(editingGrp.startTime ?? "");
      setGroupEndTime(editingGrp.endTime ?? "");
      return;
    }

    // Adding new group.
    if (addingGrp) {
      setGroupStage("");
      setGroupGrade("");
      setGroupStartTime("");
      setGroupEndTime("");
    }
  }, [editingGrp, addingGrp]);

  const handleAddLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    await addLocation(name, teacherId);
    setAddingLoc(false);
    showToast(`✅ تم إضافة السنتر "${name}" بنجاح`);
    loadData();
  };

  const handleUpdateLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLoc) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    await updateLocation(editingLoc.id, name);
    setEditingLoc(null);
    showToast("✅ تم تحديث اسم السنتر");
    loadData();
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    const res = await deleteLocation(id);
    if (!res.success) {
      showToast(res.error!, 'error');
    } else {
      showToast("🗑️ تم حذف السنتر بنجاح");
      loadData();
    }
  };

  const handleAddGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingGrp) return;
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();

    if (!groupStage) {
      showToast("الرجاء اختيار المرحلة.", "error");
      return;
    }
    if (groupGrade === "") {
      showToast("الرجاء اختيار الصف.", "error");
      return;
    }
    if (!groupStartTime || !groupEndTime) {
      showToast("الرجاء اختيار وقت البدء ووقت الانتهاء.", "error");
      return;
    }

    try {
      await addGroup(addingGrp, {
        name,
        stage: groupStage,
        grade: groupGrade as number,
        startTime: groupStartTime,
        endTime: groupEndTime,
      }, teacherId);
      setAddingGrp(null);
      setGroupStage("");
      setGroupGrade("");
      setGroupStartTime("");
      setGroupEndTime("");
      showToast("✅ تم إضافة المجموعة بنجاح");
      loadData();
    } catch (err) {
      showToast((err as Error).message ?? "حدث خطأ أثناء إضافة المجموعة", "error");
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGrp) return;
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();

    if (!groupStage) {
      showToast("الرجاء اختيار المرحلة.", "error");
      return;
    }
    if (groupGrade === "") {
      showToast("الرجاء اختيار الصف.", "error");
      return;
    }
    if (!groupStartTime || !groupEndTime) {
      showToast("الرجاء اختيار وقت البدء ووقت الانتهاء.", "error");
      return;
    }

    try {
      await updateGroup(editingGrp.locId, editingGrp.id, {
        name,
        stage: groupStage,
        grade: groupGrade as number,
        startTime: groupStartTime,
        endTime: groupEndTime,
      });
      setEditingGrp(null);
      setGroupStage("");
      setGroupGrade("");
      setGroupStartTime("");
      setGroupEndTime("");
      showToast("✅ تم تحديث المجموعة بنجاح");
      loadData();
    } catch (err) {
      showToast((err as Error).message ?? "حدث خطأ أثناء تحديث المجموعة", "error");
    }
  };

  const handleDeleteGroup = async (locId: string, grpId: string, grpName: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${grpName}"؟`)) return;
    const res = await deleteGroup(locId, grpId);
    if (!res.success) {
      showToast(res.error!, 'error');
    } else {
      showToast("🗑️ تم حذف المجموعة بنجاح");
      loadData();
    }
  };

  const timeOptions = toTimeOptions(30);
  
  // Filter valid grades by settings — only show enabled grades for the selected stage
  const validGrades = groupStage ? getEnabledGradesForLevel(groupStage) : [];

  if (enabledLevels.length === 0 && !loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-6 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
          <MapPin className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 mb-2">لم يتم تفعيل أي صفوف بعد</h2>
          <p className="text-gray-400 dark:text-gray-500 font-medium">يرجى تفعيل المراحل والصفوف من صفحة الإعدادات لتتمكن من إدارة المجموعات</p>
        </div>
        <Link href="/teacher/settings" className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          الذهاب للإعدادات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'
        }`}>
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">إدارة السناتر والمجموعات</h1>
          <p className="text-gray-400 dark:text-gray-500 font-medium tracking-wide">نظم مواعيد الحصص والأماكن لكل مرحلة دراسية</p>
        </div>
        
        <button 
          onClick={() => setAddingLoc(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          إضافة سنتر جديد
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-20 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <MapPin className="w-16 h-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500 font-bold text-lg">لا يوجد سناتر بعد</p>
          <p className="text-gray-300 dark:text-gray-600 text-sm mt-2">ابدأ بإضافة سنتر جديد من الزر أعلاه</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {locations.map((loc) => {
            const totalInLoc = loc.groups.reduce(
              (sum: number, g: GroupRecord) => sum + (studentCounts[g.id] || 0),
              0
            );
            return (
              <div key={loc.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Location Header */}
                <div className="p-8 bg-slate-50 dark:bg-gray-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 dark:text-gray-100">{loc.name}</h2>
                      <p className="text-xs font-bold text-slate-400 dark:text-gray-500">
                        {loc.groups.length} مجموعات دراسية 
                        {totalInLoc > 0 && <span className="mr-2 text-primary">• {totalInLoc} طالب إجمالاً</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingLoc(loc)}
                      className="p-3 bg-white dark:bg-gray-700 text-slate-400 dark:text-gray-400 rounded-xl hover:text-primary transition-all shadow-sm"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteLocation(loc.id, loc.name)}
                      className="p-3 bg-white dark:bg-gray-700 text-slate-400 dark:text-gray-400 rounded-xl hover:text-red-500 transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setAddingGrp(loc.id)}
                      className="mr-4 bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      مجموعة جديدة
                    </button>
                  </div>
                </div>

                {/* Groups Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loc.groups.map((grp: GroupRecord) => {
                      const count = studentCounts[grp.id] || 0;
                      const stageName =
                        grp.stage ? EDUCATION_LEVELS.find((l) => l.id === grp.stage)?.nameAr : undefined;
                      const gradeLabel =
                        grp.stage && typeof grp.grade === "number" ? getGradeLabel(grp.stage, grp.grade) : undefined;
                      return (
                        <div key={grp.id} className="group p-6 rounded-3xl bg-gray-50 dark:bg-gray-700/30 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingGrp({ ...grp, locId: loc.id })}
                                className="p-2 text-slate-400 dark:text-gray-400 hover:text-primary transition-all rounded-lg hover:bg-primary/10"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteGroup(loc.id, grp.id, grp.name)}
                                className="p-2 text-slate-400 dark:text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 dark:text-gray-100 mb-3">{grp.name}</h3>
                          <div className="flex flex-col gap-2">
                            {(stageName && typeof grp.grade === "number") ? (
                              <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-600">
                                <p className="text-[10px] font-black text-slate-600 dark:text-gray-300">
                                  {stageName} • الصف {grp.grade}
                                </p>
                                {gradeLabel && (
                                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1">{gradeLabel}</p>
                                )}
                              </div>
                            ) : null}
                            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-600">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm font-black text-slate-600 dark:text-gray-300 tabular-nums">
                                {formatTimeTo12Hour(grp.startTime)} - {formatTimeTo12Hour(grp.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-600">
                              <Users className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-bold text-slate-600 dark:text-gray-300">
                                <span className="font-black text-emerald-600 dark:text-emerald-400">{count}</span> طالب مسجل
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {loc.groups.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-gray-50/50 dark:bg-gray-700/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                        <p className="text-gray-400 dark:text-gray-500 font-bold">لا يوجد مجموعات لهذا السنتر بعد</p>
                        <button 
                          onClick={() => setAddingGrp(loc.id)}
                          className="mt-3 text-primary font-black text-sm underline underline-offset-4"
                        >
                          إضافة مجموعة الآن
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Location Modal */}
      {(addingLoc || editingLoc) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="bg-slate-50 dark:bg-gray-700/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-black dark:text-gray-100">{editingLoc ? 'تعديل السنتر' : 'إضافة سنتر جديد'}</h3>
              <button 
                onClick={() => { setAddingLoc(false); setEditingLoc(null); }}
                className="p-2 bg-white dark:bg-gray-600 rounded-xl text-slate-400 dark:text-gray-300 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingLoc ? handleUpdateLocation : handleAddLocation} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600 dark:text-gray-300 mr-1">اسم السنتر / المكان</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  defaultValue={editingLoc?.name}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-lg dark:text-gray-100"
                  placeholder="مثال: سنتر النصرية"
                  autoFocus
                />
              </div>
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {editingLoc ? 'حفظ التعديلات' : 'إضافة الآن'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {(addingGrp || editingGrp) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="bg-slate-50 dark:bg-gray-700/50 p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-black dark:text-gray-100">{editingGrp ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}</h3>
              <button 
                onClick={() => { setAddingGrp(null); setEditingGrp(null); }}
                className="p-2 bg-white dark:bg-gray-600 rounded-xl text-slate-400 dark:text-gray-300 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingGrp ? handleUpdateGroup : handleAddGroup} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-600 dark:text-gray-300 mr-1">اسم المجموعة</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  defaultValue={editingGrp?.name}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black dark:text-gray-100"
                  placeholder="مثال: مجموعة السبت 4 عصراً"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-600 dark:text-gray-300 mr-1">المرحلة</label>
                  <select
                    value={groupStage}
                    onChange={(e) => {
                      const v = e.target.value as SchoolLevel;
                      setGroupStage(v);
                      setGroupGrade("");
                    }}
                    required
                    name="stage"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold dark:text-gray-100"
                  >
                    <option value="">اختر المرحلة</option>
                    {enabledLevels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-600 dark:text-gray-300 mr-1">الصف الدراسي</label>
                  <select
                    value={groupGrade}
                    onChange={(e) => {
                      const v = e.target.value;
                      setGroupGrade(v === "" ? "" : Number(v));
                    }}
                    required
                    disabled={!groupStage}
                    name="grade"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-100"
                  >
                    <option value="">
                      {groupStage ? "اختر الصف" : "اختر المرحلة أولاً"}
                    </option>
                    {validGrades.map((n) => (
                      <option key={n} value={n}>
                        الصف {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-600 dark:text-gray-300 mr-1">وقت البدء</label>
                  <select
                    value={groupStartTime}
                    onChange={(e) => setGroupStartTime(e.target.value)}
                    required
                    name="startTime"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold dark:text-gray-100"
                  >
                    <option value="">اختر الوقت</option>
                    {timeOptions.map((opt) => (
                      <option key={opt.value24} value={opt.value24}>
                        {opt.label12}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-600 dark:text-gray-300 mr-1">وقت الانتهاء</label>
                  <select
                    value={groupEndTime}
                    onChange={(e) => setGroupEndTime(e.target.value)}
                    required
                    name="endTime"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold dark:text-gray-100"
                  >
                    <option value="">اختر الوقت</option>
                    {timeOptions.map((opt) => (
                      <option key={opt.value24} value={opt.value24}>
                        {opt.label12}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {editingGrp ? 'حفظ التعديلات' : 'إضافة الآن'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
