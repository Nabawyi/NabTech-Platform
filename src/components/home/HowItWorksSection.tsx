export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "سجل كمدرس",
      desc: "أنشئ حسابك الخاص ببياناتك كمعلم في ثوانٍ معدودة."
    },
    {
      num: "02",
      title: "احصل على كودك الخاص",
      desc: "بمجرد القبول، ستحصل على كود دعوة فريد لمنصتك."
    },
    {
      num: "03",
      title: "الطلاب يسجلوا بالكود",
      desc: "سيستخدم طلابك الكود الخاص بك للانضمام إلى مجموعاتك."
    },
    {
      num: "04",
      title: "ابدأ إدارة منصتك",
      desc: "أضف دروسك، تابع الحضور، وأدِر الاشتراكات بسهولة كاملة."
    }
  ];

  return (
    <section className="py-24 bg-white" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-red-500 font-bold tracking-wider uppercase text-sm mb-2 block">خطوات بسيطة</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
            كيف تعمل منصة NabTech؟
          </h2>
          <p className="text-gray-500 font-medium">
            أربع خطوات فقط وتكون منصتك جاهزة بالكامل لاستقبال الطلاب.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-[28px] rtl:right-[15%] rtl:left-[15%] ltr:left-[15%] ltr:right-[15%] h-[2px] bg-gray-100 z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center font-black text-xl text-slate-900 shadow-sm mb-6">
                {step.num}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
