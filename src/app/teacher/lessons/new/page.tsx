"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Save, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";
import { addLesson, type QuizQuestion } from "@/app/actions/lessons";
import { EDUCATION_LEVELS, SchoolLevel, getGradeLabel } from "@/lib/constants";
import { normalizeStageGrade } from "@/lib/education";
import { useSettings } from "@/components/providers/SettingsProvider";

type QuestionDraft = {
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
};

function AddLessonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Basic fields
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<SchoolLevel>("secondary");
  const [gradeNumber, setGradeNumber] = useState(1);

  useEffect(() => {
    const l = searchParams.get("level") as SchoolLevel;
    const g = searchParams.get("gradeNumber");
    if (l && EDUCATION_LEVELS.some(lvl => lvl.id === l)) setLevel(l);
    if (g) setGradeNumber(parseInt(g));
  }, [searchParams]);

  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  // Quiz
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", "", "", ""], correct: 0 },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = <K extends keyof QuestionDraft>(
    idx: number,
    field: K,
    value: QuestionDraft[K]
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts: [string, string, string, string] = [...q.options] as [
          string,
          string,
          string,
          string,
        ];
        opts[oIdx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;
    if (!normalizeStageGrade(level, gradeNumber)) {
      alert("يجب اختيار مرحلة وصف دراسي صالحين (الابتدائي 1–6، الإعدادي/الثانوي 1–3)");
      return;
    }
    setSaving(true);

    const cleanQuestions: QuizQuestion[] = questions
      .filter((q) => q.text.trim() && q.options.every((o) => o.trim()))
      .map((q, i) => ({
        id: "q_" + Date.now() + "_" + i,
        text: q.text,
        options: q.options,
        correct: q.correct,
      }));

    await addLesson({
      teacherId: settings.id,
      title,
      level,
      gradeNumber,
      grade: getGradeLabel(level, gradeNumber), // Compat
      videoUrl,
      description,
      pdfUrl: pdfUrl.trim() || undefined,
      questions: cleanQuestions,
    });

    setSaving(false);
    setDone(true);
    setTimeout(() => router.push("/teacher/lessons"), 1500);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black">تم حفظ الدرس بنجاح!</h2>
        <p className="text-gray-400 font-medium">جاري الانتقال لقائمة الدروس...</p>
      </div>
    );
  }

  const currentLevelInfo = EDUCATION_LEVELS.find(l => l.id === level);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/teacher/lessons")}
          className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-primary transition-all shadow-sm"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground">إضافة درس جديد</h1>
          <p className="text-sm text-gray-400 font-medium">أدخل تفاصيل الدرس للمرحلة {currentLevelInfo?.nameAr}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-700 border-b border-gray-100 pb-4">معلومات الدرس الأساسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-600">المرحلة الدراسية *</label>
              <select
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value as SchoolLevel);
                  setGradeNumber(1);
                }}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold"
              >
                {EDUCATION_LEVELS.map(l => (
                  <option key={l.id} value={l.id}>{l.nameAr}</option>
                ))}
              </select>
            </div>

            {/* Grade Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-600">الصف الدراسي *</label>
              <select
                value={gradeNumber}
                onChange={(e) => setGradeNumber(parseInt(e.target.value))}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold"
              >
                {currentLevelInfo?.grades.map(g => (
                  <option key={g.number} value={g.number}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-black text-slate-600">عنوان الدرس *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                placeholder="مثال: الدعامة في الكائنات الحية"
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-black text-slate-600">رابط الفيديو (YouTube) *</label>
              <input
                type="url"
                required
                dir="ltr"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-left"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-black text-slate-600">وصف الدرس (اختياري)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold resize-none"
                placeholder="اكتب نبذة عن محتوى الدرس..."
              />
            </div>

            {/* PDF URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-black text-slate-600">رابط ملف PDF (اختياري)</label>
              <input
                type="url"
                dir="ltr"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-left"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
        </div>

        {/* Quiz Builder Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-slate-700">أسئلة الدرس (اختياري)</h2>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl font-black text-sm hover:bg-primary hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة سؤال
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold">لا توجد أسئلة بعد</p>
              <p className="text-gray-300 text-sm mt-1">اضغط «إضافة سؤال» لبناء اختبار للدرس</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, qi) => (
                <div key={qi} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                      {qi + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                      className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-bold"
                      placeholder="نص السؤال..."
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-12">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuestion(qi, "correct", oi as 0 | 1 | 2 | 3)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${
                            q.correct === oi
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-gray-300 hover:border-emerald-400"
                          }`}
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none font-medium text-sm"
                          placeholder={`الخيار ${oi + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 mr-12">
                    ● الإجابة الصحيحة: الخيار {q.correct + 1}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {saving ? (
            <span className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              حفظ ونشر الدرس
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AddLessonPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">جاري التحميل...</div>}>
      <AddLessonForm />
    </Suspense>
  );
}
