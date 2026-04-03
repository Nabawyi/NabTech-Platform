"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getTeachers,
  approveTeacher,
  rejectTeacher,
  deactivateTeacher,
  deleteTeacher,
  type TeacherRecord,
} from "@/app/actions/teachers";

// Format phone for WhatsApp (Egyptian: 01x → 201x)
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

export default function OwnerDashboard() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [filter, setFilter] = useState<"pending" | "active" | "inactive" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Deactivate / Delete modal state
  const [deactivateTarget, setDeactivateTarget] = useState<TeacherRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherRecord | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);

  const loadTeachers = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    const interval = setInterval(loadTeachers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const result = await approveTeacher(id);
      if (result.success) loadTeachers();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await rejectTeacher(id);
      loadTeachers();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setRejectingId(null);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      const result = await deactivateTeacher(deactivateTarget.id);
      if (result.success) {
        setDeactivateTarget(null);
        loadTeachers();
      }
    } catch (err) {
      console.error("Deactivate failed:", err);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeletingTeacher(true);
    try {
      const result = await deleteTeacher(deleteTarget.id);
      if (result.success) {
        setDeleteTarget(null);
        loadTeachers();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeletingTeacher(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const pendingTeachers = teachers.filter((t) => t.status === "pending");
  const activeTeachers = teachers.filter((t) => t.status === "active");
  const inactiveTeachers = teachers.filter((t) => t.status === "inactive" || t.status === "rejected");
  const displayedTeachers = filter === "all" ? teachers : teachers.filter((t) => t.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px]">
            <UserCheck className="w-3.5 h-3.5" />
            مفعّل
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 font-black text-[10px]">
            <Clock className="w-3.5 h-3.5" />
            قيد المراجعة
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 font-black text-[10px]">
            <Ban className="w-3.5 h-3.5" />
            موقوف
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-black text-[10px]">
            <XCircle className="w-3.5 h-3.5" />
            مرفوض
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => setFilter("all")}
          className={`bg-white p-6 rounded-3xl shadow-sm border ${filter === "all" ? "border-slate-800 ring-2 ring-slate-800/10" : "border-gray-100 hover:border-slate-300"} cursor-pointer flex items-center gap-4 transition-all`}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-500">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">إجمالي المعلمين</p>
            <p className="text-2xl font-black text-slate-800">{teachers.length}</p>
          </div>
        </div>

        <div 
          onClick={() => setFilter("pending")}
          className={`bg-white p-6 rounded-3xl shadow-sm border ${filter === "pending" ? "border-amber-500 ring-2 ring-amber-500/10" : "border-gray-100 hover:border-amber-200"} cursor-pointer flex items-center gap-4 transition-all`}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">بانتظار الموافقة</p>
            <p className="text-2xl font-black text-amber-600">{pendingTeachers.length}</p>
          </div>
        </div>

        <div 
          onClick={() => setFilter("active")}
          className={`bg-white p-6 rounded-3xl shadow-sm border ${filter === "active" ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-gray-100 hover:border-emerald-200"} cursor-pointer flex items-center gap-4 transition-all`}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">معلمون مفعّلون</p>
            <p className="text-2xl font-black text-emerald-600">{activeTeachers.length}</p>
          </div>
        </div>

        <div 
          onClick={() => setFilter("inactive")}
          className={`bg-white p-6 rounded-3xl shadow-sm border ${filter === "inactive" ? "border-gray-500 ring-2 ring-gray-500/10" : "border-gray-100 hover:border-gray-300"} cursor-pointer flex items-center gap-4 transition-all`}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-500">
            <Ban className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">موقوفون</p>
            <p className="text-2xl font-black text-gray-600">{inactiveTeachers.length}</p>
          </div>
        </div>
      </div>

      {/* Pending Teachers Alert */}
      {pendingTeachers.length > 0 && (
        <div className="bg-amber-50 p-6 rounded-[2rem] shadow-sm border border-amber-200 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-800">
                طلبات تسجيل جديدة
              </h2>
              <p className="text-xs font-bold text-amber-600">
                {pendingTeachers.length} معلم بانتظار الموافقة
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Teachers Table */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-black text-slate-800">إدارة المعلمين</h2>
          </div>
          <span className="text-xs font-black text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">
            {displayedTeachers.length} {filter === "pending" ? "طلبات" : "معلم"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-gray-50">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-5">الاسم</th>
                <th className="px-6 py-5">البريد الإلكتروني</th>
                <th className="px-6 py-5">الهاتف</th>
                <th className="px-6 py-5">الحالة</th>
                <th className="px-6 py-5">تاريخ التسجيل</th>
                <th className="px-6 py-5">كود الدعوة</th>
                <th className="px-6 py-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-bold">
                    {filter === "pending" ? "لا يوجد طلبات حالياً" : "لا يوجد معلمون مسجلون بعد"}
                  </td>
                </tr>
              ) : (
                displayedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    {/* Name */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          teacher.status === "inactive" ? "bg-gray-100 text-gray-400" : "bg-primary/10 text-primary"
                        }`}>
                          {teacher.name.charAt(0)}
                        </div>
                        <span className={`font-black text-sm ${
                          teacher.status === "inactive" ? "text-gray-400 line-through" : "text-slate-800"
                        }`}>
                          {teacher.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span dir="ltr">{teacher.email}</span>
                      </div>
                    </td>

                    {/* Phone + WhatsApp */}
                    <td className="px-6 py-5">
                      {teacher.phone ? (
                        <a
                          href={formatWhatsAppUrl(teacher.phone) ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors group/wa"
                        >
                          <span className="tabular-nums" dir="ltr">{teacher.phone}</span>
                          <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md group-hover/wa:bg-emerald-500 group-hover/wa:text-white transition-all">
                            <MessageCircle className="w-3 h-3" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">لا يوجد</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">{getStatusBadge(teacher.status)}</td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-500 tabular-nums">
                        {new Date(teacher.created_at).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Invite Code */}
                    <td className="px-6 py-5">
                      {teacher.invite_code ? (
                        <button
                          onClick={() => handleCopyCode(teacher.invite_code!)}
                          className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all group/copy"
                        >
                          <span className="font-black text-primary text-sm tracking-widest">
                            {teacher.invite_code}
                          </span>
                          {copiedCode === teacher.invite_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-primary/50 group-hover/copy:text-primary transition-colors" />
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300">
                          يتم توليده عند الموافقة
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* Pending → Approve / Reject */}
                        {teacher.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(teacher.id)}
                              disabled={approvingId === teacher.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                              {approvingId === teacher.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              قبول
                            </button>
                            <button
                              onClick={() => handleReject(teacher.id)}
                              disabled={rejectingId === teacher.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] border border-red-200 hover:bg-red-500 hover:text-white hover:border-transparent transition-all disabled:opacity-60"
                            >
                              {rejectingId === teacher.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              رفض
                            </button>
                          </>
                        )}

                        {/* Active → Deactivate + Delete */}
                        {teacher.status === "active" && (
                          <>
                            <button
                              onClick={() => setDeactivateTarget(teacher)}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-black text-[10px] border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-transparent transition-all"
                            >
                              <Power className="w-3.5 h-3.5" />
                              إيقاف
                            </button>
                            <button
                              onClick={() => setDeleteTarget(teacher)}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] border border-red-200 hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </button>
                          </>
                        )}

                        {/* Inactive → Reactivate + Delete */}
                        {teacher.status === "inactive" && (
                          <>
                            <button
                              onClick={() => handleApprove(teacher.id)}
                              disabled={approvingId === teacher.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-transparent transition-all disabled:opacity-60"
                            >
                              {approvingId === teacher.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              إعادة تفعيل
                            </button>
                            <button
                              onClick={() => setDeleteTarget(teacher)}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] border border-red-200 hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </button>
                          </>
                        )}

                        {/* Rejected → Approve + Delete */}
                        {teacher.status === "rejected" && (
                          <>
                            <button
                              onClick={() => handleApprove(teacher.id)}
                              disabled={approvingId === teacher.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-transparent transition-all disabled:opacity-60"
                            >
                              {approvingId === teacher.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              إعادة تفعيل
                            </button>
                            <button
                              onClick={() => setDeleteTarget(teacher)}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] border border-red-200 hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ Deactivate Confirmation Modal ═══════ */}
      {deactivateTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-5">
                <Power className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">إيقاف المدرس</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                هل أنت متأكد من إيقاف هذا المدرس؟
              </p>
              <div className="mt-4 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100 w-full">
                <p className="text-sm font-black text-amber-700">
                  {deactivateTarget.name}
                </p>
                <p className="text-[10px] font-bold text-amber-500 mt-1">
                  {deactivateTarget.email} • لن يتمكن من تسجيل الدخول
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeactivateTarget(null)}
                disabled={isDeactivating}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeactivateConfirm}
                disabled={isDeactivating}
                className="py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeactivating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    <span>إيقاف</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Delete Confirmation Modal ═══════ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">حذف المدرس</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                هل أنت متأكد من حذف هذا المدرس؟ لا يمكن التراجع عن هذا الإجراء
              </p>
              <div className="mt-4 px-4 py-3 bg-red-50 rounded-2xl border border-red-100 w-full">
                <p className="text-sm font-black text-red-700">
                  {deleteTarget.name}
                </p>
                <p className="text-[10px] font-bold text-red-500 mt-1">
                  سيتم حذف جميع البيانات المرتبطة: الطلاب والدروس والمجموعات والاشتراكات
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingTeacher}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeletingTeacher}
                className="py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeletingTeacher ? (
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
    </div>
  );
}
