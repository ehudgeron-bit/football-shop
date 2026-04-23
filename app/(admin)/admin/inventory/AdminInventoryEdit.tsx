"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Props {
  variantId: string;
  currentStock: number;
}

export function AdminInventoryEdit({ variantId, currentStock }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentStock);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });
      if (!res.ok) { toast("שגיאה בעדכון מלאי", "error"); return; }
      toast("מלאי עודכן", "success");
      setEditing(false);
      window.location.reload();
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-text-secondary underline hover:text-text-primary"
      >
        עדכן
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        autoFocus
        className="w-16 rounded-6 border border-surface-tertiary px-1 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      <div className="flex gap-1">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-4 bg-brand-primary px-2 py-0.5 text-xs text-white disabled:opacity-50"
        >
          {saving ? "..." : "✓"}
        </button>
        <button
          onClick={() => { setEditing(false); setValue(currentStock); }}
          className="rounded-4 border border-surface-tertiary px-2 py-0.5 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
