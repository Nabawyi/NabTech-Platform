"use client";

import { CheckCircle2, Shield, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function BenefitsSection() {
  const benefits = [
    "وفر وقتك من المهام المتكررة",
    "نظم شغلك ودروسك بطريقة احترافية",
    "زود دخلك بمتابعة الاشتراكات آلياً",
    "كل حاجة في مكان واحد (دروس، امتحانات، حضور)"
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 relative" id="benefits">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sky-600 dark:text-sky-400 font-bold tracking-wider uppercase text-sm mb-4 block inline-block py-1.5 px-4 bg-sky-50 dark:bg-sky-500/10 rounded-full border border-sky-100 dark:border-sky-500/20 shadow-sm">
              القيمة المُضافة
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-6 leading-tight text-slate-900 dark:text-white tracking-tight">
              لماذا يستخدم المدرسون <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-400 to-blue-600">NabTech</span>؟
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl mb-10 leading-relaxed font-medium">
              تم تصميم النظام خصيصاً ليحل المشاكل التقنية والتنظيمية التي يواجهها المعلم الحديث، ليلتفت بالكامل لعملية الشرح والإبداع.
            </p>
            <ul className="space-y-5">
              {benefits.map((benefit, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/60 transition-all">
                    <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-blue-600/20 blur-3xl rounded-[3rem] -z-10 animate-pulse"></div>
            <div className="bg-white/80 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-sky-900/10 backdrop-blur-xl">
               <div className="flex flex-col gap-6">
                  <motion.div 
                    whileHover={{ x: -8 }}
                    className="flex items-center gap-5 bg-white dark:bg-slate-800 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 hover:border-sky-200 dark:hover:border-sky-500/30 transition-all shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-slate-900 text-amber-500 shadow-sm flex items-center justify-center flex-shrink-0 border border-sky-100 dark:border-slate-800">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg">المركزية والسرعة</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">الوصول لبيانات 1000 طالب في جزء من الثانية.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ x: -8 }}
                    className="flex items-center gap-5 bg-white dark:bg-slate-800 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 hover:border-sky-200 dark:hover:border-sky-500/30 transition-all shadow-sm sm:rtl:mr-8 sm:ltr:ml-8"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-slate-900 text-sky-500 shadow-sm flex items-center justify-center flex-shrink-0 border border-sky-100 dark:border-slate-800">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg">أمان وحماية</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">بيانات طلابك مشفرة ومتاحة لك أنت فقط.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ x: -8 }}
                    className="flex items-center gap-5 bg-white dark:bg-slate-800 p-6 rounded-[1.8rem] border border-slate-100 dark:border-slate-700/50 hover:border-sky-200 dark:hover:border-sky-500/30 transition-all shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-slate-900 text-indigo-500 shadow-sm flex items-center justify-center flex-shrink-0 border border-sky-100 dark:border-slate-800">
                      <RefreshCw className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg">تحديثات مستمرة</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">إضافة ميزات أسبوعية بناءً على طلبات المعلمين.</p>
                    </div>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
