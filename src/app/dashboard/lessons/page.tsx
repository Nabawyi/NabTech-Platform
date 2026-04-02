import { getLessonsByLevelAndGrade } from "@/app/actions/lessons";
import { getUserSession } from "@/app/actions/students";
import { getGradeLabel } from "@/lib/constants";
import Link from "next/link";
import { PlayCircle, FileText, HelpCircle, BookOpen } from "lucide-react";

function extractYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default async function StudentLessonsPage() {
  const session = await getUserSession();
  const studentLevel = session?.stage ?? session?.level ?? "secondary";
  const studentGradeNum = session?.gradeNumber ?? 1;
  const gradeLabel = getGradeLabel(studentLevel, studentGradeNum);
  const lessons = await getLessonsByLevelAndGrade(studentLevel, studentGradeNum);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">الدروس</h1>
            <p className="text-gray-400 font-medium mt-1">
              دروس <span className="font-black text-primary">{gradeLabel}</span> — {lessons.length} درس متاح
            </p>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      {lessons.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold text-lg">لا يوجد دروس لصافك حتى الآن</p>
          <p className="text-gray-300 text-sm mt-2">سيتم إضافة دروسك قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => {
            const thumb = extractYouTubeThumbnail(lesson.videoUrl);
            return (
              <Link
                key={lesson.id}
                href={`/dashboard/lessons/${lesson.id}`}
                className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbs; dynamic URLs
                    <img src={thumb} alt={lesson.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-slate-900 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white/40" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                      <PlayCircle className="w-8 h-8" />
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {lesson.pdfUrl && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> PDF
                      </span>
                    )}
                    {lesson.questions.length > 0 && (
                      <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                        <HelpCircle className="w-2.5 h-2.5" /> {lesson.questions.length} أسئلة
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-black text-slate-800 text-lg mb-2 group-hover:text-primary transition-colors">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-sm text-gray-400 font-medium line-clamp-2">{lesson.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                      مشاهدة الدرس ←
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
