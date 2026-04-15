"use client";

import { useEffect, useState } from "react";
import { FileText, Award, Calendar, Search, ListChecks, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentResultsAction } from "@/app/actions/exams";
import { type StudentResultRow } from "@/types/domain";

export default function QuizResultsPage() {
  const [results, setResults] = useState<StudentResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getStudentResultsAction();
      if (res.success && res.results) {
        setResults(res.results);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredResults = results.filter(r =>
    r.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
    if (percentage >= 65) return "text-blue-500 bg-blue-50 dark:bg-blue-500/10";
    if (percentage >= 50) return "text-orange-500 bg-orange-50 dark:bg-orange-500/10";
    return "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ListChecks className="w-8 h-8 text-indigo-500" />
            نتائج الاختبارات
          </h1>
          <p className="text-slate-400 font-medium mt-1">نتائجك في جميع الاختبارات والامتحانات</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث عن اختبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center rounded-3xl mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-500 font-black text-lg">لا توجد نتائج اختبارات بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredResults.map((result, idx) => {
              const score = result.score || 0;
              const total = result.total_score || 0;
              const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
              const colorClass = getScoreColor(percentage);

              return (
                <motion.div
                  key={result.result_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all overflow-hidden relative shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-1 items-center gap-5 w-full z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${colorClass}`}>
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {getTypeLabel(result.exam_type)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(result.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                        {result.exam_title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-50 dark:border-slate-800 z-10">
                    <div className="text-right flex flex-col items-end">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1 md:hidden">الدرجة المحصلة</p>
                       <div className="flex items-baseline gap-1 justify-end">
                         <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{score}</span>
                         <span className="text-slate-400 text-sm font-bold">/ {total || '—'}</span>
                       </div>
                       <div className={`text-[14px] font-black px-3 py-1 rounded-full mt-1.5 shadow-sm ${colorClass}`}>
                         {percentage}%
                       </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-slate-200 dark:text-slate-700 group-hover:text-indigo-500/30 transition-all" />
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
