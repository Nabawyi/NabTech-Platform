import type { SubscriptionStatus } from "@/app/actions/subscriptions";

interface StatusConfig {
  label: string;
  dot: string;    // dot color
  badge: string;  // badge container classes
  text: string;   // text classes
}

const STATUS_MAP: Record<SubscriptionStatus, StatusConfig> = {
  active: {
    label: "نشط",
    dot:   "bg-emerald-500",
    badge: "bg-success border-success",
    text:  "text-success-fg font-black",
  },
  expiring_soon: {
    label: "ينتهي قريباً",
    dot:   "bg-orange-500 animate-pulse",
    badge: "bg-warning border-warning",
    text:  "text-warning-fg font-black",
  },
  expired: {
    label: "منتهي",
    dot:   "bg-danger-fg",
    badge: "bg-danger border-danger",
    text:  "text-danger-fg font-black",
  },
  inactive: {
    label: "غير مفعل",
    dot:   "bg-muted-fg",
    badge: "bg-muted border-card-border",
    text:  "text-muted-fg font-black",
  },
};

export default function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.inactive;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider
        border ${cfg.badge} ${cfg.text}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
