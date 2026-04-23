"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PAID", "CANCELLED"],
  PAID:       ["REFUNDED"],
  FAILED:     ["CANCELLED"],
};

const LABELS: Record<string, string> = {
  PROCESSING: "סמן כבעיבוד", PAID: "סמן כשולם",
  CANCELLED: "בטל הזמנה", REFUNDED: "סמן כהוחזר",
};

interface AdminOrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function AdminOrderActions({ orderId, currentStatus }: AdminOrderActionsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const transitions = VALID_TRANSITIONS[currentStatus] ?? [];
  if (transitions.length === 0) return <span className="text-xs text-text-muted">—</span>;

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast("סטטוס עודכן", "success");
        router.refresh();
      } else {
        toast("שגיאה בעדכון סטטוס", "error");
      }
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      {transitions.map((t) => (
        <button
          key={t}
          disabled={loading}
          onClick={() => updateStatus(t)}
          className={`rounded-pill px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
            t === "CANCELLED" || t === "REFUNDED"
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-surface-secondary text-text-primary hover:bg-surface-tertiary"
          }`}
        >
          {LABELS[t] ?? t}
        </button>
      ))}
    </div>
  );
}
