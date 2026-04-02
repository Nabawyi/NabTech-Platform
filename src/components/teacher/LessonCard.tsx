"use client";

import { PlayCircle, FileText, HelpCircle, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { type Lesson, deleteLesson } from "@/app/actions/lessons";
import { useRouter } from "next/navigation";

interface LessonCardProps {
  lesson: Lesson;
  onDelete?: () => void;
}

export default function LessonCard({ lesson, onDelete }: LessonCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
      await deleteLesson(lesson.id);
      if (onDelete) onDelete();
      router.refresh();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-6 hover:shadow-md dark:hover:shadow-gray-900/30 transition-all group">
      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <PlayCircle className="w-7 h-7" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-slate-800 dark:text-gray-100 text-lg truncate group-hover:text-primary transition-colors">
          {lesson.title}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium truncate mt-0.5">
          {lesson.description || "لا يوجد وصف لهذا الدرس"}
        </p>
        
        <div className="flex items-center gap-4 mt-3">
          {lesson.pdfUrl && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
              <FileText className="w-3 h-3" /> PDF
            </span>
          )}
          {lesson.questions.length > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
              <HelpCircle className="w-3 h-3" /> {lesson.questions.length} أسئلة
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/teacher/lessons/${lesson.id}/edit`}
          className="p-3 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-400 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all shadow-sm"
          title="تعديل الدرس"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
        <button
          onClick={handleDelete}
          className="p-3 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-400 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
          title="حذف الدرس"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
