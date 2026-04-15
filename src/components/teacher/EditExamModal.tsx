"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { updateExamAction } from "@/app/actions/exams";
import { type ExamRow } from "@/types/domain";
import { EDUCATION_LEVELS } from "@/lib/constants";

interface EditExamModalProps {
  exam: ExamRow;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditExamModal({ exam, onClose, onSuccess }: EditExamModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: exam.title,
    type: exam.type as "quiz" | "midterm" | "final",
    total_score: exam.total_score,
    grade_code: exam.grade_code,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateExamAction(exam.id, formData);
    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      alert("فشل تحديث الاختبار: " + res.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-white">
          <h3 className="text-xl font-black">تعديل بيانات الاختبار</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-600 dark:text-slate-400 mr-1">عنوان الاختبار</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600 dark:text-slate-400 mr-1">نوع الاختبار</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold dark:text-white"
              >
                <option value="quiz">اختبار قصير</option>
                <option value="midterm">نصفي</option>
                <option value="final">نهائي</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-600 dark:text-slate-400 mr-1">الدرجة النهائية</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.total_score}
                onChange={(e) => setFormData({...formData, total_score: parseInt(e.target.value)})}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 transition-all font-bold dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-600 dark:text-slate-400 mr-1">الصف الدراسي</label>
            <select
              value={formData.grade_code}
              onChange={(e) => setFormData({...formData, grade_code: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 transition-all font-bold dark:text-white"
            >
              {EDUCATION_LEVELS.flatMap(lvl => lvl.grades.map(g => (
                <option key={g.code} value={g.code}>{lvl.nameAr} - {g.label}</option>
              )))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ التعديلات
          </button>
        </form>
      </div>
    </div>
  );
}
