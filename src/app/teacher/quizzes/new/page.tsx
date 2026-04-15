"use client";

import { useState } from "react";
import { ArrowRight, Save, Info, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createExamAction } from "@/app/actions/exams";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function NewQuizPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "quiz" as "quiz" | "midterm" | "final",
    total_score: 10,
    grade_code: "",
  });

  // Filter levels and grades based on teacher settings
  const enabledGrades = EDUCATION_LEVELS.flatMap(level =>
    level.grades
      .filter(g => settings.enabled_grade_codes.includes(g.code))
      .map(g => ({
        code: g.code,
        label: `${level.nameAr} - ${g.label}`,
      }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError("يرجى إدخال عنوان الاختبار");
      return;
    }
    if (!formData.grade_code) {
      setError("يرجى اختيار الصف الدراسي");
      return;
    }
    if (formData.total_score <= 0) {
      setError("يجب أن تكون الدرجة النهائية أكبر من 0");
      return;
    }

    setLoading(true);
    const res = await createExamAction(formData);
    setLoading(false);

    if (res.success && res.exam) {
      router.push(`/teacher/quizzes/${res.exam.id}`);
    } else {
      setError(res.error || "فشل إنشاء الاختبار");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        href="/teacher/quizzes"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold mb-8 transition-colors group"
      >
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        العودة لقائمة الاختبارات
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Save className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">اختبار جديد</h1>
            <p className="text-slate-400 font-medium">حدد تفاصيل الاختبار لتبدأ رصد الدرجات</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-sm font-bold"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-2">
              عنوان الاختبار
              <Info className="w-4 h-4 text-slate-300" />
            </label>
            <input
              type="text"
              placeholder="مثال: اختبار شهر أكتوبر"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2">نوع الاختبار</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="quiz">اختبار قصير</option>
                <option value="midterm">امتحان نصفي</option>
                <option value="final">امتحان نهائي</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2">الدرجة النهائية</label>
              <input
                type="number"
                value={formData.total_score}
                onChange={(e) => setFormData({ ...formData, total_score: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-2">الصف الدراسي</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {enabledGrades.map((grade) => (
                <button
                  key={grade.code}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade_code: grade.code })}
                  className={`p-4 rounded-2xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${
                    formData.grade_code === grade.code
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-500/30"
                  }`}
                >
                  {formData.grade_code === grade.code && <CheckCircle2 className="w-4 h-4" />}
                  {grade.label}
                </button>
              ))}
            </div>
            {enabledGrades.length === 0 && (
              <p className="text-rose-500 text-xs font-bold mt-2 pr-2">
                يجب تفعيل صفوف دراسية من الإعدادات أولاً
              </p>
            )}
          </div>

          <div className="pt-6">
            <button
              disabled={loading || enabledGrades.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-[1.5rem] font-black text-lg transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  حفظ وإنشاء الاختبار
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
