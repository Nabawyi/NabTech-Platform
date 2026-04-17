"use client";

import { motion, Variants } from "framer-motion";
import { UserPlus, Key, Users, Sliders } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "سجل كمدرس",
      desc: "أنشئ حسابك الخاص ببياناتك كمعلم في ثوانٍ معدودة وابدأ رحلتك.",
      icon: UserPlus
    },
    {
      num: "02",
      title: "احصل على كودك الخاص",
      desc: "بمجرد القبول، ستحصل على كود دعوة فريد لمنصتك الخاصة.",
      icon: Key
    },
    {
      num: "03",
      title: "الطلاب يسجلوا بالكود",
      desc: "سيستخدم طلابك الكود الخاص بك للانضمام إلى مجموعاتك بسهولة.",
      icon: Users
    },
    {
      num: "04",
      title: "ابدأ إدارة منصتك",
      desc: "أضف دروسك، تابع الحضور، وأدِر الاشتراكات بكل احترافية ويسر.",
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
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="how-it-works">
      {/* Ambient background blur */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-sky-400/10 dark:bg-sky-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block py-1 px-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full font-bold tracking-wider uppercase text-sm mb-4 border border-sky-200 dark:border-sky-800/30">
            خطوات بسيطة
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            كيف تعمل منصة <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-400 to-blue-600">NabTech</span>؟
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
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
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[4rem] rtl:right-[12%] rtl:left-[12%] ltr:left-[12%] ltr:right-[12%] h-[2px] bg-gradient-to-r from-transparent via-sky-300 dark:via-sky-700/50 to-transparent z-0"></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative z-10 flex flex-col items-center text-center bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 group overflow-hidden"
              >
                {/* Decorative Number Background */}
                <div className="absolute -top-4 -right-4 text-[8rem] font-black text-slate-50 dark:text-slate-800/40 z-0 select-none group-hover:scale-110 group-hover:text-sky-50 dark:group-hover:text-sky-900/10 transition-all duration-500 leading-none">
                  {step.num}
                </div>
                
                <div className="w-20 h-20 rounded-2xl bg-sky-50 dark:bg-slate-900 flex items-center justify-center text-sky-500 shadow-sm border border-sky-100 dark:border-slate-800 mb-8 relative z-10 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 group-hover:rotate-3">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 relative z-10 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
