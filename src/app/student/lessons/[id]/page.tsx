"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getLessonById, type Lesson } from "@/app/actions/lessons";
import { markLessonViewed, updateLessonProgress, getLessonProgress, type LessonProgress } from "@/app/actions/progress";
import { PlayCircle, FileText, HelpCircle, ArrowRight, Download, CheckCircle2, XCircle, Trophy, Eye, Clock } from "lucide-react";
import Link from "next/link";

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&enablejsapi=1`;
  return url;
}

export default function StudentLessonPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Progress simulation (YouTube API not available in iframe sandbox easily)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    Promise.all([getLessonById(id), getLessonProgress(id)]).then(([data, prog]) => {
      setLesson(data);
      setProgress(prog);
      if (data) setAnswers(new Array(data.questions.length).fill(null));
      setLoading(false);
    });
  }, [id]);

  // Mark as viewed immediately on mount and simulate progress increment
  useEffect(() => {
    if (!id) return;
    markLessonViewed(id).then(() => {
      setProgress((prev) => prev ? { ...prev, hasViewed: true } : null);
    });

    // Simulate gradual progress tracking every 30s
    progressTimer.current = setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + 5);
      updateLessonProgress(id, progressRef.current);
    }, 30000);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <PlayCircle className="w-16 h-16 text-gray-200" />
        <h2 className="text-xl font-black text-gray-400">الدرس غير موجود</h2>
        <Link href="/student/lessons" className="text-primary font-black underline underline-offset-4">العودة للدروس</Link>
      </div>
    );
  }

  const score = submitted
    ? answers.reduce<number>((acc, a, i) => acc + (a === lesson.questions[i].correct ? 1 : 0), 0)
    : 0;
  const total = lesson.questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Back */}
      <Link
        href="/student/lessons"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-sm"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للدروس
      </Link>

      {/* Progress badge (if viewed before) */}
      {progress?.hasViewed && (
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black">
            <Eye className="w-3.5 h-3.5" /> تمت المشاهدة
          </span>
          {progress.progressPercentage > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-black text-primary">{progress.progressPercentage}%</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Video + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="rounded-[2rem] overflow-hidden bg-black shadow-2xl shadow-black/20 aspect-video">
            <iframe
              src={getYouTubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Title & Description */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-4">
            <h1 className="text-2xl font-black text-foreground">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-gray-500 font-medium leading-relaxed">{lesson.description}</p>
            )}
          </div>

          {/* Quiz Section */}
          {total > 0 ? (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">اختبار الدرس</h2>
                  <p className="text-sm text-gray-400 font-medium">{total} سؤال — اختر الإجابة الصحيحة</p>
                </div>
              </div>

              {!quizStarted ? (
                <div className="p-8 text-center space-y-6">
                  <p className="text-gray-400 font-medium">اختبر فهمك لهذا الدرس</p>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.99] transition-all"
                  >
                    ابدأ الاختبار
                  </button>
                </div>
              ) : submitted ? (
                /* Results */
                <div className="p-8 space-y-6">
                  <div className={`rounded-3xl p-8 text-center ${pct >= 50 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${pct >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {pct >= 50 ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>
                    <h3 className={`text-3xl font-black mb-2 ${pct >= 50 ? 'text-emerald-700' : 'text-red-700'}`}>{pct}%</h3>
                    <p className={`font-black text-lg mb-1 ${pct >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {pct >= 50 ? "أحسنت! اجتزت الاختبار" : "حاول مرة أخرى"}
                    </p>
                    <p className="text-sm font-medium text-gray-500">{score} إجابة صحيحة من {total}</p>
                  </div>

                  {/* Review */}
                  <div className="space-y-4">
                    {lesson.questions.map((q, qi) => {
                      const isCorrect = answers[qi] === q.correct;
                      return (
                        <div key={q.id} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                          <p className="font-black text-slate-800 mb-3">{qi + 1}. {q.text}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div
                                key={oi}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold ${
                                  oi === q.correct ? 'bg-emerald-200/60 text-emerald-800' :
                                  oi === answers[qi] && !isCorrect ? 'bg-red-200/60 text-red-800' :
                                  'text-gray-500'
                                }`}
                              >
                                {oi === q.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> :
                                 oi === answers[qi] ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> :
                                 <span className="w-4 h-4 flex-shrink-0" />}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => { setAnswers(new Array(total).fill(null)); setSubmitted(false); }}
                    className="w-full py-4 rounded-2xl border-2 border-gray-200 font-black hover:bg-gray-50 transition-all"
                  >
                    إعادة الاختبار
                  </button>
                </div>
              ) : (
                /* Quiz Questions */
                <div className="p-8 space-y-6">
                  {lesson.questions.map((q, qi) => (
                    <div key={q.id} className="space-y-3">
                      <p className="font-black text-slate-800">{qi + 1}. {q.text}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            type="button"
                            onClick={() => setAnswers((prev) => prev.map((a, i) => i === qi ? oi : a))}
                            className={`w-full text-right px-5 py-3.5 rounded-2xl border-2 font-medium text-sm transition-all ${
                              answers[qi] === oi
                                ? 'border-primary bg-primary/10 text-primary font-black'
                                : 'border-gray-100 bg-gray-50 text-slate-600 hover:border-primary/30 hover:bg-primary/5'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={answers.some((a) => a === null)}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    تسليم الإجابات
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 text-center text-gray-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-bold">لا توجد أسئلة لهذا الدرس</p>
            </div>
          )}
        </div>

        {/* Sidebar: PDF */}
        <div className="space-y-6">
          {lesson.pdfUrl && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-lg text-foreground mb-4">ملحقات الدرس</h3>
              <a
                href={lesson.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-all group"
              >
                <div className="flex items-center gap-3 font-black">
                  <FileText className="w-5 h-5" />
                  مذكرة الدرس PDF
                </div>
                <Download className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          )}

          <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 text-center space-y-3">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <PlayCircle className="w-7 h-7" />
            </div>
            <h3 className="font-black text-foreground">تابع مشاهدة الفيديو</h3>
            <p className="text-sm text-gray-400 font-medium">شاهد الدرس بالكامل قبل الإجابة على الأسئلة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
