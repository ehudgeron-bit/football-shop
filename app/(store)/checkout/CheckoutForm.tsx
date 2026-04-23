"use client";

import { useState } from "react";
import Link from "next/link";
import type { Address } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface CheckoutFormProps {
  addresses: Address[];
}

export function CheckoutForm({ addresses }: CheckoutFormProps) {
  const { toast } = useToast();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);

  // New address inline form
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zipCode: "" });
  const [savingAddress, setSavingAddress] = useState(false);

  async function saveNewAddress() {
    if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
      toast("נא למלא את כל שדות הכתובת", "error");
      return;
    }
    setSavingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 }),
      });
      if (!res.ok) { toast("שגיאה בשמירת הכתובת", "error"); return; }
      const saved = await res.json();
      setSelectedAddressId(saved.id);
      setShowNewAddress(false);
      // Reload page to show saved address in list
      window.location.reload();
    } catch {
      toast("שגיאת שרת", "error");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePay() {
    if (!selectedAddressId) {
      toast("נא לבחור כתובת משלוח", "error");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "שגיאה ביצירת ההזמנה", "error");
        return;
      }

      // Redirect to Tranzila hosted payment page
      window.location.href = data.redirectUrl;
    } catch {
      toast("שגיאת שרת", "error");
      setLoading(false);
    }
    // Don't setLoading(false) here — user is being redirected
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Shipping address */}
      <section className="rounded-12 border border-surface-tertiary bg-white p-6">
        <h2 className="mb-4 text-base font-semibold">כתובת משלוח</h2>

        {addresses.length > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 rounded-8 border p-4 transition-colors ${
                  selectedAddressId === addr.id
                    ? "border-brand-primary bg-gray-50"
                    : "border-surface-tertiary hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <p className="font-medium">{addr.street}</p>
                  <p className="text-text-secondary">
                    {addr.city}, {addr.zipCode}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {showNewAddress ? (
          <div className="flex flex-col gap-4 rounded-8 border border-surface-tertiary p-4">
            <Input
              label="רחוב ומספר"
              value={newAddress.street}
              onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
              placeholder="הרצל 10"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="עיר"
                value={newAddress.city}
                onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                placeholder="תל אביב"
              />
              <Input
                label="מיקוד"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress((p) => ({ ...p, zipCode: e.target.value }))}
                placeholder="6100000"
                dir="ltr"
              />
            </div>
            <div className="flex gap-3">
              <Button size="sm" loading={savingAddress} onClick={saveNewAddress}>
                שמור כתובת
              </Button>
              {addresses.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setShowNewAddress(false)}>
                  ביטול
                </Button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewAddress(true)}
            className="text-sm font-medium text-text-secondary hover:text-text-primary underline"
          >
            + הוסף כתובת חדשה
          </button>
        )}
      </section>

      {/* Payment info */}
      <section className="rounded-12 border border-surface-tertiary bg-white p-6">
        <h2 className="mb-4 text-base font-semibold">תשלום מאובטח</h2>
        <div className="flex items-center gap-3 rounded-8 bg-surface-secondary p-4 text-sm text-text-secondary">
          <span className="text-xl">🔒</span>
          <p>
            התשלום מתבצע בצורה מאובטחת דרך{" "}
            <span className="font-medium text-text-primary">Tranzila</span>.
            פרטי הכרטיס לא נשמרים אצלנו.
          </p>
        </div>
      </section>

      {/* CTA */}
      <Button
        fullWidth
        size="lg"
        loading={loading}
        disabled={!selectedAddressId}
        onClick={handlePay}
      >
        {loading ? "מעביר לדף תשלום..." : "המשך לתשלום"}
      </Button>

      <p className="text-center text-xs text-text-muted">
        בלחיצה על 'המשך לתשלום' אתה מסכים ל
        <Link href="/terms" className="underline">תנאי השימוש</Link>
      </p>
    </div>
  );
}
