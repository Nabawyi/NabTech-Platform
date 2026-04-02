"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, MapPin, Clock, User, Phone, Key, GraduationCap, AlertCircle } from "lucide-react";
import { addStudent } from "@/app/actions/students";
import { validateEgyptianPhone } from "@/lib/validation";
import { getLocations } from "@/app/actions/locations";
import { getTeacherByInviteCode, type TeacherSettings } from "@/app/actions/settings";
import { EDUCATION_LEVELS, SchoolLevel, getGradeLabel } from "@/lib/constants";
import { formatTimeTo12Hour } from "@/lib/time";
import type { GroupRecord, LocationRecord } from "@/types/domain";

export default function JoinPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Teacher & Data from Step 1
  const [teacher, setTeacher] = useState<TeacherSettings | null>(null);
  const [locations, setLocations] = useState<LocationRecord[]>([]);

  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone validation errors
  const [phoneError, setPhoneError] = useState("");
  const [parentPhoneError, setParentPhoneError] = useState("");
  
  // Step 2 Form States
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>("secondary");
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate student phone
    const phoneCheck = validateEgyptianPhone(phone, "رقم الطالب");
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error ?? "رقم الهاتف غير صالح");
      return;
    }
    setPhoneError("");
    
    // Validate parent phone (now required)
    const parentCheck = validateEgyptianPhone(parentPhone, "رقم ولي الأمر");
    if (!parentCheck.valid) {
      setParentPhoneError(parentCheck.error ?? "رقم ولي الأمر مطلوب");
      return;
    }
    setParentPhoneError("");

    setIsValidating(true);
    setError("");

    try {
      const foundTeacher = await getTeacherByInviteCode(inviteCode.trim());
      if (!foundTeacher) {
        setError("كود المعلم غير صحيح، يرجى التأكد من الكود والمحاولة مرة أخرى.");
        setIsValidating(false);
        return;
      }

      // Fetch this specific teacher's locations
      const teacherLocs = await getLocations(foundTeacher.id);
      
      setTeacher(foundTeacher);
      setLocations(teacherLocs);
      
      // Auto-set the first enabled level if any
      if (foundTeacher.enabled_levels.length > 0) {
        const firstLevel = foundTeacher.enabled_levels[0] as SchoolLevel;
        setSelectedLevel(firstLevel);
        const firstGrade = foundTeacher.enabled_grades.find(g => [1,2,3,4,5,6].includes(g));
        if (firstGrade) setSelectedGrade(firstGrade);
      }

      setStep(2);
    } catch (err) {
      setError("حدث خطأ أثناء التحقق، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    
    setIsSubmitting(true);
    try {
      await addStudent({
        teacherId: teacher.id,
        name,
        phone: phone.trim(),
        password,
        parentPhone: parentPhone.trim(),
        stage: selectedLevel,
        grade: selectedGrade,
        level: selectedLevel,
        gradeNumber: selectedGrade,
        locationId: selectedLocation,
        groupId: selectedGroup,
      });
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">أهلاً بك يا بطل!</h2>
          <p className="text-gray-400 font-bold mb-10 leading-relaxed text-lg">
            تم إرسال طلبك للمعلم <span className="text-primary">{teacher?.name}</span> بنجاح. سنقوم بمراجعة بياناتك وتفعيل حسابك قريباً.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <ArrowRight className="w-6 h-6" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Derived Values
  const enabledGrades = teacher ? teacher.enabled_grades : [];
  const levelGrades = EDUCATION_LEVELS.find(l => l.id === selectedLevel)?.grades.filter(g => enabledGrades.includes(g.number)) || [];
  
  const currentLoc = locations.find(l => l.id === selectedLocation);
  const availableGroups = currentLoc ? currentLoc.groups.filter(g => g.stage === selectedLevel && g.grade === selectedGrade) : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 p-4 sm:p-8" dir="rtl">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-gray-100 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`h-1 w-12 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>
          <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
            {step === 1 ? 'البيانات الشخصية كود المعلم' : 'اختيار المجموعة والمرحلة'}
          </span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleValidateCode} className="p-10 space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-foreground">انضم لعائلتنا التعليمية</h1>
              <p className="text-gray-400 font-bold">يرجى إدخال بياناتك وكود المعلم الذي زودك به</p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> الاسم الرباعي
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary outline-none font-bold transition-all shadow-sm"
                  placeholder="محمد أحمد علي..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> رقم الهاتف (واتساب)
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
                    setPhone(val);
                    if (val.length > 0) {
                      const check = validateEgyptianPhone(val, "رقم الطالب");
                      setPhoneError(check.valid ? "" : (check.error ?? ""));
                    } else {
                      setPhoneError("رقم الهاتف مطلوب");
                    }
                  }}
                  className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 ${phoneError ? 'border-red-400 bg-red-50/50' : 'border-transparent'} focus:bg-white focus:border-primary outline-none font-bold transition-all shadow-sm text-center ltr tabular-nums`}
                  placeholder="01xxxxxxxxx"
                />
                {phoneError && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" /> رقم ولي الأمر
                </label>
                <input 
                  type="tel" 
                  required
                  value={parentPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
                    setParentPhone(val);
                    if (val.length > 0) {
                      const check = validateEgyptianPhone(val, "رقم ولي الأمر");
                      setParentPhoneError(check.valid ? "" : (check.error ?? ""));
                    } else {
                      setParentPhoneError("رقم ولي الأمر مطلوب");
                    }
                  }}
                  className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 ${parentPhoneError ? 'border-red-400 bg-red-50/50' : 'border-transparent'} focus:bg-white focus:border-primary outline-none font-bold transition-all shadow-sm text-center ltr tabular-nums`}
                  placeholder="01xxxxxxxxx"
                />
                {parentPhoneError && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {parentPhoneError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" /> كلمة المرور
                  </label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary outline-none font-bold transition-all shadow-sm text-center"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> كود المعلم
                  </label>
                  <input 
                    type="text" 
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-6 py-4 rounded-2xl bg-primary/5 text-primary border-transparent focus:border-primary border-2 border-dashed outline-none font-black transition-all shadow-sm text-center tracking-widest placeholder:font-bold placeholder:text-primary/30"
                    placeholder="BIO-XXXX"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isValidating || !!phoneError || !!parentPhoneError}
              className="w-full py-5 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isValidating ? <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : "التالي: اختيار المجموعة"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitFinal} className="p-10 space-y-8 animate-in slide-in-from-left-8 duration-500">
            <div className="text-center space-y-1">
              <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">أهلاً بك مع {teacher?.name}</p>
              <h2 className="text-2xl font-black text-foreground">حدد مرحلتك وموعد حضورك</h2>
            </div>

            <div className="space-y-6">
              {/* Level & Grade Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500">المرحلة الدراسية</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                    {teacher?.enabled_levels.map((lvlId) => {
                      const lvl = EDUCATION_LEVELS.find(l => l.id === lvlId);
                      return (
                        <button
                          key={lvlId}
                          type="button"
                          onClick={() => {
                            setSelectedLevel(lvlId as SchoolLevel);
                            const grades = teacher.enabled_grades.filter(g => EDUCATION_LEVELS.find(l => l.id === lvlId)?.grades.some(sg => sg.number === g));
                            if (grades.length > 0) setSelectedGrade(grades[0]);
                          }}
                          className={`flex-1 py-3 px-2 rounded-xl font-black text-[10px] transition-all ${selectedLevel === lvlId ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          {lvl?.nameAr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500">الصف الدراسي</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
                    {levelGrades.map((grade) => (
                      <button
                        key={grade.number}
                        type="button"
                        onClick={() => setSelectedGrade(grade.number)}
                        className={`flex-1 py-3 px-4 whitespace-nowrap rounded-xl font-black text-[10px] transition-all ${selectedGrade === grade.number ? "bg-primary text-white shadow-sm" : "bg-white text-gray-400 hover:text-gray-600"}`}
                      >
                        {grade.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location & Group Selector */}
              <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> السنتر / مكان الحضور
                    </label>
                    <select 
                      required
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setSelectedGroup("");
                      }}
                      className="w-full px-6 py-4 rounded-2xl border-transparent bg-white focus:border-primary outline-none font-bold transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">اختر السنتر</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> مواعيد المجموعات المتاحة
                    </label>
                    <select 
                      required
                      disabled={!selectedLocation}
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-transparent bg-white focus:border-primary outline-none font-bold transition-all shadow-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{selectedLocation ? "اختر الموعد" : "اختر السنتر أولاً"}</option>
                      {availableGroups.length > 0 ? (
                        availableGroups.map((grp) => (
                          <option key={grp.id} value={grp.id}>
                            {grp.name} ({formatTimeTo12Hour(grp.startTime)} - {formatTimeTo12Hour(grp.endTime)})
                          </option>
                        ))
                      ) : (
                        selectedLocation && <option value="" disabled>لا توجد مجموعات متاحة لهذا الصف في هذا السنتر</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
               <button 
                type="button"
                onClick={() => setStep(1)}
                className="px-8 py-5 rounded-2xl bg-slate-100 text-gray-500 font-black hover:bg-slate-200 transition-all active:scale-95"
              >
                رجوع
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-5 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : "إرسال طلب الانضمام"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
