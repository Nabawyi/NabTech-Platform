import Link from "next/link";
import { AlertCircle, MessageSquare, Home } from "lucide-react";

export default function SubscriptionRequiredPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
      
      <div className="bg-card border border-card-border p-10 md:p-16 rounded-[3rem] shadow-sm max-w-xl w-full flex flex-col items-center relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-danger/20 blur-3xl" />

        <div className="w-24 h-24 bg-danger text-danger-fg rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-danger/20 relative z-10 border border-card-border">
          <AlertCircle className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight relative z-10">الاشتراك غير مفعل</h1>
        <p className="text-muted-fg font-medium max-w-md mx-auto leading-relaxed mb-10 relative z-10">
          عذراً، لا يمكنك مشاهدة الدروس أو امتحانات المنصة لأن اشتراكك الحالي غير نشط أو انتهت صلاحيته. يرجى التواصل مع الدعم أو المعلم لتجديد حسابك.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
          <Link 
            href="https://wa.me/201008957377" 
            target="_blank"
            className="flex-1 bg-success text-success-fg px-8 py-4 rounded-2xl font-black shadow-lg shadow-success/10 border border-success hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            تجديد الاشتراك
          </Link>
          <Link 
            href="/dashboard"
            className="flex-1 bg-muted border border-card-border text-foreground px-8 py-4 rounded-2xl font-black hover:bg-card-border hover:shadow-sm transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5 text-muted-fg" />
            الرئيسية
          </Link>
        </div>
      </div>
      
      <p className="mt-12 text-[10px] font-black text-muted-fg uppercase tracking-widest leading-loose opacity-60">
        ALAA SHETA • SECURE SUBSCRIPTION SYSTEM
      </p>
    </div>
  );
}
