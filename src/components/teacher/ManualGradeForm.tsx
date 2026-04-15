"use client";

import { useState } from "react";
import { User, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { upsertSingleScoreByCodeAction } from "@/app/actions/exams";

interface ManualGradeFormProps {
  examId: string;
  onSuccess: () => void;
}

export default function ManualGradeForm({ examId, onSuccess }: ManualGradeFormProps) {
  const [loading, setLoading] = useState(false);
  const [studentCode, setStudentCode] = useState("");
  const [score, setScore] = useState("");
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() || score === "") return;
    
    setLoading(true);
    setMsg(null);
    const res = await upsertSingleScoreByCodeAction(examId, studentCode.trim(), Number(score));
    setLoading(false);

    if (res.success) {
      setMsg({ text: `تم رصد درجة الطالب: ${res.studentName || studentCode}`, type: 'success' });
      setStudentCode("");
      setScore("");
      onSuccess();
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ text: res.error || "خطأ غير معروف", type: 'error' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
          <User className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">رصد سريع بالكود</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="كود الطالب (ID)"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white"
          />
        </div>
        <div className="w-full md:w-32 relative">
          <input
            type="number"
            placeholder="الدرجة"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-center focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !studentCode.trim() || score === ""}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
          رصد الآن
        </button>
      </form>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl font-bold text-sm flex items-center gap-3 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            }`}
          >
            {msg.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
