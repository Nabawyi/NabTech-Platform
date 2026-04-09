"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

import { loginUser } from "@/app/actions/students";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await loginUser(identifier, password);
      
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.role === "owner") {
        router.push("/owner");
      } else if (res.role === "admin") {
        router.push("/teacher");
      } else if (res.role === "student") {
        router.push("/student");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 p-4 sm:p-8 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 backdrop-blur-sm border border-white/10">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black relative z-10 mb-2">تسجيل الدخول</h1>
          <p className="text-white/70 font-medium text-sm relative z-10">
            مرحباً بعودتك! الرجاء إدخال بياناتك للدخول إلى حسابك.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold text-foreground">
              البريد الإلكتروني للإدارة / رقم هاتف الطالب
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                id="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
                placeholder="البريد أو رقم الهاتف"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              أدخل كلمة <span className="text-primary font-bold">admin</span> في البريد للدخول كمعلم
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-bold text-foreground">
                كلمة المرور
              </label>
              <Link href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
              تذكرني على هذا الجهاز
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-md shadow-primary/20"
          >
            {isSubmitting ? (
              <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 text-center space-y-3">
          <p className="text-sm font-medium text-gray-600 mb-4">
            ليس لديك حساب بعد؟
          </p>
          <Link 
            href="/join"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-gray-200 text-foreground font-bold hover:border-primary hover:text-primary transition-colors"
          >
            طلب انضمام جديد المرة الأولى
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/register-teacher"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold hover:bg-primary hover:text-white transition-all"
          >
            تسجيل كمعلم جديد
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
