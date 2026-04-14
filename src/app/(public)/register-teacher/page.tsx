"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  Mail,
  Key,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { registerTeacher } from "@/app/actions/teachers";
import { validateEgyptianPhone } from "@/lib/validation";

export default function RegisterTeacherPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      setEmailError("البريد الإلكتروني مطلوب");
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) {
      setEmailError("صيغة البريد الإلكتروني غير صحيحة");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone
    const phoneCheck = validateEgyptianPhone(phone, "رقم الهاتف");
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error ?? "رقم الهاتف غير صالح");
      return;
    }
    setPhoneError("");

    // Validate email
    if (!validateEmail(email)) return;

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 4) {
      setPasswordError("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    setPasswordError("");

    setIsSubmitting(true);

    try {
      const result = await registerTeacher({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (!result.success) {
        setError(result.error ?? "حدث خطأ أثناء التسجيل");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white dark:bg-[#0B0F19] p-4 transition-colors duration-300"
        dir="rtl"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-500 border border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            تم إرسال طلبك بنجاح!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold mb-10 leading-relaxed text-lg">
            سيتم مراجعة طلبك من قبل إدارة المنصة وإشعارك عند الموافقة.
            <br />
            <span className="text-primary font-black">
              ستتمكن من تسجيل الدخول فور الموافقة
            </span>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <ArrowRight className="w-6 h-6 mr-1" />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white dark:bg-[#0B0F19] p-4 sm:p-8 relative overflow-hidden transition-colors duration-300"
      dir="rtl"
    >
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 backdrop-blur-sm border border-white/10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black relative z-10 mb-2">
            تسجيل معلم جديد
          </h1>
          <p className="text-white/70 font-medium text-sm relative z-10">
            أنشئ حسابك كمعلم على المنصة. سيتم مراجعة طلبك من الإدارة.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold p-4 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-500/20">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              الاسم بالكامل
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none font-bold text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm"
              placeholder="مثال: د. محمد أحمد"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value.length > 3) validateEmail(e.target.value);
              }}
              className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border-2 ${
                emailError
                  ? "border-red-400 bg-red-50/50 dark:bg-red-500/10"
                  : "border-transparent"
              } focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none font-bold text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm text-left`}
              placeholder="teacher@example.com"
              dir="ltr"
            />
            {emailError && (
              <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              رقم الهاتف (واتساب)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
                setPhone(val);
                if (val.length > 0) {
                  const check = validateEgyptianPhone(val, "رقم الهاتف");
                  setPhoneError(check.valid ? "" : check.error ?? "");
                } else {
                  setPhoneError("رقم الهاتف مطلوب");
                }
              }}
              className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border-2 ${
                phoneError
                  ? "border-red-400 bg-red-50/50 dark:bg-red-500/10"
                  : "border-transparent"
              } focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none font-bold text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm text-center ltr tabular-nums`}
              placeholder="01xxxxxxxxx"
            />
            {phoneError && (
              <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {phoneError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none font-bold text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm text-center"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-500" />
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none font-bold text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm text-center"
                placeholder="••••••••"
              />
            </div>
          </div>
          {passwordError && (
            <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {passwordError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !!phoneError || !!emailError}
            className="w-full py-5 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "إرسال طلب التسجيل"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            لديك حساب بالفعل؟
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-bold hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary transition-all duration-200"
          >
            تسجيل الدخول
            <ArrowRight className="w-4 h-4 mr-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
