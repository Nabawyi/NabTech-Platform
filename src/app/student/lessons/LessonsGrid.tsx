"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PlayCircle, FileText, HelpCircle, BookOpen } from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  pdfUrl?: string;
  questions: any[];
}

interface LessonsGridProps {
  initialLessons: Lesson[];
  gradeLabel: string;
}

function extractYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default function LessonsGrid({ initialLessons, gradeLabel }: LessonsGridProps) {
  const [search, setSearch] = useState("");

  const filteredLessons = useMemo(() => {
    if (!search.trim()) return initialLessons;
    const term = search.toLowerCase();
    return initialLessons.filter(
      (l) =>
        l.title.toLowerCase().includes(term) ||
        (l.description && l.description.toLowerCase().includes(term))
    );
  }, [search, initialLessons]);

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-card p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-card-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">الدروس</h1>
              <p className="text-muted-fg font-medium mt-1">
                دروس <span className="font-black text-primary">{gradeLabel}</span> — {filteredLessons.length} درس متاح
              </p>
            </div>
          </div>

          <SearchInput
            onSearch={setSearch}
            placeholder="ابحث عن درس..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-card p-20 rounded-[2.5rem] border border-card-border text-center animate-in fade-in zoom-in duration-300">
          <BookOpen className="w-16 h-16 text-muted/20 mx-auto mb-4" />
          <p className="text-muted-fg font-bold text-lg">
            {search ? "لم يتم العثور على دروس تطابق بحثك" : "لا يوجد دروس لصفك حتى الآن"}
          </p>
          <p className="text-muted/40 text-sm mt-2">
            {search ? "جرب البحث بكلمات أخرى" : "سيتم إضافة دروسك قريباً"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredLessons.map((lesson) => {
            const thumb = extractYouTubeThumbnail(lesson.videoUrl);
            return (
              <Link
                key={lesson.id}
                href={`/student/lessons/${lesson.id}`}
                className="group bg-card rounded-[2rem] shadow-sm border border-card-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbs
                    <img
                      src={thumb}
                      alt={lesson.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-muted-fg/20" />
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
                      <span className="bg-danger text-danger-fg text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <FileText className="w-2.5 h-2.5" /> PDF
                      </span>
                    )}
                    {lesson.questions.length > 0 && (
                      <span className="bg-warning text-warning-fg text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <HelpCircle className="w-2.5 h-2.5" /> {lesson.questions.length} أسئلة
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-black text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-muted-fg font-medium line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
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
