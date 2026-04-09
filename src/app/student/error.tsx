"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Student Route Error]:", error.message);
  }, [error]);

  const isAuthError =
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("session");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-foreground">
            {isAuthError ? "انتهت الجلسة" : "حدث خطأ"}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {isAuthError
              ? "يبدو أن جلستك انتهت. يرجى تسجيل الدخول مرة أخرى."
              : "حدث خطأ غير متوقع أثناء تحميل الصفحة."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {!isAuthError && (
            <button
              onClick={reset}
              className="w-full py-3 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          )}
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-foreground font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}
