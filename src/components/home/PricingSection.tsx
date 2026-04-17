"use client";

import Link from "next/link";
import { Check, Star, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const plans = [
    {
      name: "الباقة الاحترافية",
      desc: "لتنظيم وإدارة الدروس والمنصة بكفاءة وسيطرة كاملة.",
      price: "تواصل معنا",
      duration: "للأسعار الخاصة",
      features: [
        "عدد غير محدود من الطلاب مجانًا",
        "إدارة كاملة للدروس والمحاضرات",
        "نظام كويزات آلي متقدم مدمج بالمنصة",
        "سجلات وتقارير تفصيلية لولي الأمر",
        "دعم فني شخصي 24/7 طوال الأسبوع"
      ],
      cta: "تواصل معنا الآن",
      href: "#contact",
      isPopular: true
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="pricing">
      {/* Background Decor */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-sky-400/5 dark:bg-sky-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block py-1 px-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full font-bold tracking-wider uppercase text-sm mb-4 border border-sky-200 dark:border-sky-800/30 shadow-sm">
            الأسعار
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            خطة أسعار تناسب طموحك
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
            وفر وقتك وجهدك وابدأ في إدارة منصتك بكل احترافية وبدون تعقيد.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 to-blue-600/20 blur-3xl rounded-[3rem] -z-10 animate-pulse"></div>
          
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 transition-all duration-300 border-2 border-sky-400 dark:border-sky-500 shadow-2xl shadow-sky-900/10"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-1.5 bg-gradient-to-l from-sky-400 to-blue-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg shadow-sky-500/30">
                  <Star className="w-4 h-4 fill-current text-amber-300" />
                  الباقة الموصى بها
                </div>
              </div>

              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 text-center tracking-tight">{plan.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-center text-lg">{plan.desc}</p>
              
              <div className="mb-10 flex flex-col items-center justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">{plan.duration}</span>
              </div>

              <ul className="space-y-5 mb-10 max-w-sm mx-auto">
                {plan.features.map((feature, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-sky-50 text-sky-500 dark:bg-sky-900/40 dark:text-sky-400">
                      <Check className="w-5 h-5 font-black" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Link
                href={plan.href}
                className="group flex items-center justify-center gap-2 w-full py-5 px-6 rounded-2xl font-bold text-xl text-center transition-all active:scale-95 bg-sky-500 text-white hover:bg-sky-600 shadow-xl shadow-sky-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10">{plan.cta}</span>
                <ArrowLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
