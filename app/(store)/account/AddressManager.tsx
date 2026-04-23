"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      street: formData.get("street"),
      city: formData.get("city"),
      zipCode: formData.get("zipCode"),
      isDefault: addresses.length === 0, // first address is default
    };

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "שגיאה בשמירת הכתובת", "error");
        return;
      }

      setAddresses((prev) => [...prev, data]);
      setShowForm(false);
      toast("הכתובת נשמרה בהצלחה", "success");
      router.refresh();
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) { toast("שגיאה במחיקת הכתובת", "error"); return; }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast("הכתובת נמחקה", "success");
    } catch {
      toast("שגיאת שרת", "error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-text-secondary">אין כתובות שמורות עדיין.</p>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="flex items-start justify-between rounded-8 border border-surface-tertiary p-4"
        >
          <div className="text-sm">
            <p className="font-medium">{addr.street}</p>
            <p className="text-text-secondary">
              {addr.city}, {addr.zipCode}
            </p>
            {addr.isDefault && (
              <span className="mt-1 inline-block rounded-4 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                ברירת מחדל
              </span>
            )}
          </div>
          <button
            onClick={() => handleDelete(addr.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            מחק
          </button>
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-4 rounded-8 border border-surface-tertiary p-4"
        >
          <Input name="street" label="רחוב ומספר בית" placeholder="הרצל 10" required />
          <div className="grid grid-cols-2 gap-3">
            <Input name="city" label="עיר" placeholder="תל אביב" required />
            <Input name="zipCode" label="מיקוד" placeholder="6100000" dir="ltr" required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={loading} size="sm">
              שמור כתובת
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => setShowForm(true)}
        >
          + הוסף כתובת חדשה
        </Button>
      )}
    </div>
  );
}
