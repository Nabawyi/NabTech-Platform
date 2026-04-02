import { Clock } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Clock className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        قريبًا...
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        نعمل حاليًا على تطوير نظام إضافة الاختبارات.
      </p>
      <Link
        href="/teacher"
        className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
