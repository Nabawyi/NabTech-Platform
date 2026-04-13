"use client";

import { motion, Variants } from "framer-motion";
import { UserPlus, Key, Users, Sliders } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "سجل كمدرس",
      desc: "أنشئ حسابك الخاص ببياناتك كمعلم في ثوانٍ معدودة.",
      icon: UserPlus
    },
    {
      num: "02",
      title: "احصل على كودك الخاص",
      desc: "بمجرد القبول، ستحصل على كود دعوة فريد لمنصتك.",
      icon: Key
    },
    {
      num: "03",
      title: "الطلاب يسجلوا بالكود",
      desc: "سيستخدم طلابك الكود الخاص بك للانضمام إلى مجموعاتك.",
      icon: Users
    },
    {
      num: "04",
      title: "ابدأ إدارة منصتك",
      desc: "أضف دروسك، تابع الحضور، وأدِر الاشتراكات بسهولة كاملة.",
      icon: Sliders
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      } 
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden" id="how-it-works">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-3 block inline-block py-1 px-3 bg-blue-50 dark:bg-blue-500/10 rounded-full">خطوات بسيطة</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
            كيف تعمل منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">NabTech</span>؟
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            أربع خطوات فقط وتكون منصتك جاهزة بالكامل لاستقبال الطلاب.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative"
        >
          <div className="hidden lg:block absolute top-[2rem] rtl:right-[15%] rtl:left-[15%] ltr:left-[15%] ltr:right-[15%] h-[2px] bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-500/20 to-transparent z-0"></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative z-10 flex flex-col items-center text-center bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                <div className="absolute top-4 right-6 text-5xl font-black text-slate-50 dark:text-slate-800/50 z-0 select-none group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner mb-6 relative z-10 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 relative z-10">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
