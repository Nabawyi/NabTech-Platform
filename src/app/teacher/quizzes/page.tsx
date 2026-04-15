"use client";

import { useEffect, useState } from "react";
import { Plus, CheckSquare, Trash2, Search, Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getTeacherExamsAction, deleteExamAction } from "@/app/actions/exams";
import { type ExamRow } from "@/types/domain";
import { EDUCATION_LEVELS } from "@/lib/constants";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await getTeacherExamsAction();
    if (res.success && res.exams) {
      setQuizzes(res.exams);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف جميع درجات الطلاب المرتبطة به.")) return;
    const res = await deleteExamAction(id);
    if (res.success) {
      setQuizzes(prev => prev.filter(e => e.id !== id));
    } else {
      alert("فشل حذف الاختبار");
    }
  };

  const filteredQuizzes = quizzes.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeLabel = (code: string) => {
    for (const level of EDUCATION_LEVELS) {
      const grade = level.grades.find(g => g.code === code);
      if (grade) return `${level.nameAr} - ${grade.label}`;
    }
    return code;
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'final': return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
      case 'midterm': return "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400";
      default: return "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'final': return "نهائي";
      case 'midterm': return "نصفي";
      case 'quiz': return "اختبار قصير";
      default: return type;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة الاختبارات</h1>
          <p className="text-slate-400 font-medium mt-1">أنشئ الاختبارات وقم بإدارة درجات الطلاب بسهولة</p>
        </div>
        <Link
          href="/teacher/quizzes/new"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/25"
        >
          <Plus className="w-5 h-5" />
          إنشاء اختبار جديد
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="relative group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="ابحث عن اختبار بالعنوان..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-12 py-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-3xl mb-6">
            <CheckSquare className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-lg">لا توجد اختبارات بعد</p>
          <p className="text-slate-400 text-sm mt-1 mb-8">ابدأ بإنشاء أول اختبار لطلابك الآن</p>
          <Link
            href="/teacher/quizzes/new"
            className="text-indigo-600 font-bold hover:underline"
          >
            اضغط هنا للبدء
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden"
              >
                {/* Type Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getBadgeStyle(quiz.type)}`}>
                    {getTypeLabel(quiz.type)}
                  </span>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{quiz.title}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {getGradeLabel(quiz.grade_code)}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date(quiz.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-slate-900 dark:text-white">
                    <span className="text-2xl font-black">{quiz.total_score}</span>
                    <span className="text-slate-400 text-sm font-bold mr-1">درجة</span>
                  </div>
                  <Link
                    href={`/teacher/quizzes/${quiz.id}`}
                    className="flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-4px] transition-transform"
                  >
                    رصد الدرجات
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                </div>

                {/* Decorative element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
