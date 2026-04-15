"use client";

import { useEffect, useState, useCallback, useMemo, use } from "react";
import { 
  ArrowRight, 
  Save, 
  Search, 
  CheckCircle2, 
  RotateCcw,
  Loader2,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getExamByIdAction, 
  getStudentsForGradeAction, 
  getResultsByExamAction, 
  saveScoresAction 
} from "@/app/actions/exams";
import { type ExamRow, type StudentExamEntry, type StudentScoreEntry } from "@/types/domain";
import ManualGradeForm from "@/components/teacher/ManualGradeForm";

export default function QuizScoreEntryPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<ExamRow | null>(null);
  const [students, setStudents] = useState<StudentExamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Local state for scores
  const [localScores, setLocalScores] = useState<Record<string, number | null>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [examRes, resultsRes] = await Promise.all([
        getExamByIdAction(quizId),
        getResultsByExamAction(quizId)
      ]);

      if (!examRes.success || !examRes.exam) {
        router.push("/teacher/quizzes");
        return;
      }

      setQuiz(examRes.exam);
      
      const actualStudentsRes = await getStudentsForGradeAction({ 
        gradeCode: examRes.exam.grade_code,
        limit: 200
      });

      if (actualStudentsRes.success && actualStudentsRes.data) {
        const studentList = actualStudentsRes.data.items;
        setStudents(studentList);

        const initialScores: Record<string, number | null> = {};
        studentList.forEach(s => initialScores[s.student_id] = null);
        
        if (resultsRes.success && resultsRes.results) {
          resultsRes.results.forEach(r => {
            initialScores[r.student_id] = r.score;
          });
        }
        
        setLocalScores(initialScores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [quizId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScoreChange = (studentId: string, val: string) => {
    const score = val === "" ? null : parseInt(val);
    
    if (score !== null) {
      if (score < 0) return;
      if (quiz && score > quiz.total_score) return;
    }

    setLocalScores(prev => ({ ...prev, [studentId]: score }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!quiz) return;
    setSaving(true);
    
    const entries: StudentScoreEntry[] = Object.entries(localScores).map(([id, score]) => ({
      exam_id: quiz.id,
      student_id: id,
      score: score
    }));

    const res = await saveScoresAction(entries);
    setSaving(false);

    if (res.success) {
      setHasUnsavedChanges(false);
      alert("تم حفظ الدرجات بنجاح");
    } else {
      alert("فشل حفظ الدرجات: " + res.error);
    }
  };

  const setAllToZero = () => {
    if (!confirm("هل أنت متأكد من تصفير جميع الدرجات؟")) return;
    const next = { ...localScores };
    Object.keys(next).forEach(id => next[id] = 0);
    setLocalScores(next);
    setHasUnsavedChanges(true);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  if (loading || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold">جاري تحميل قائمة الطلاب والدرجات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/teacher/quizzes"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors group"
        >
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          العودة لقائمة الاختبارات
        </Link>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xs font-black text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                تغييرات غير محفوظة
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={setAllToZero}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            تصفير الكل
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ الدرجات
          </button>
        </div>
      </div>

      {/* Quick Entry Form */}
      <ManualGradeForm examId={quizId} onSuccess={fetchData} />

      {/* Quiz Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{quiz.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold text-slate-400">الدرجة النهائية: <span className="text-indigo-600">{quiz.total_score}</span></span>
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="text-sm font-bold text-slate-400">إجمالي الطلاب: <span className="text-slate-900 dark:text-white">{students.length}</span></span>
              </div>
            </div>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
            />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">اسم الطالب</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">الدرجة</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left w-32">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, idx) => (
                  <motion.tr 
                    layout
                    key={student.student_id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-8 py-4 font-bold text-slate-900 dark:text-slate-200">{student.student_name}</td>
                    <td className="px-8 py-4">
                      <div className="flex justify-end">
                        <div className="relative w-24">
                          <input 
                            data-index={idx}
                            type="number" 
                            min="0"
                            max={quiz.total_score}
                            placeholder="-"
                            value={localScores[student.student_id] ?? ""}
                            onChange={(e) => handleScoreChange(student.student_id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className={`w-full bg-white dark:bg-slate-950 border rounded-xl px-4 py-2.5 text-center font-black tabular-nums transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
                              localScores[student.student_id] !== null 
                                ? "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" 
                                : "border-slate-100 dark:border-slate-900 text-slate-300"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                       <div className="flex justify-end">
                          {localScores[student.student_id] === null ? (
                            <span className="text-[10px] font-black text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">غائب/لم يرصد</span>
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
