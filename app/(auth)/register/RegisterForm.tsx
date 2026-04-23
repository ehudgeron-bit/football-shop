"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { registerSchema } from "@/lib/validators/auth";
import type { RegisterInput } from "@/lib/validators/auth";

type FieldErrors = Partial<Record<keyof RegisterInput, string[]>>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: (formData.get("phone") as string) || undefined,
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: [data.error] });
        } else if (res.status === 422 && data.details) {
          setErrors(data.details);
        } else {
          toast(data.error ?? "שגיאת שרת", "error");
        }
        return;
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        toast("נרשמת בהצלחה! אנא התחבר.", "success");
        router.push("/login");
        return;
      }

      fetch("/api/cart/merge", { method: "POST" }).catch(() => {});

      toast("ברוך הבא! נרשמת בהצלחה.", "success");
      router.push("/");
      router.refresh();
    } catch {
      toast("שגיאת שרת, נסה שוב", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="rounded-12 border border-surface-tertiary bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="firstName"
              label="שם פרטי"
              placeholder="ישראל"
              autoComplete="given-name"
              error={errors.firstName?.[0]}
            />
            <Input
              name="lastName"
              label="שם משפחה"
              placeholder="ישראלי"
              autoComplete="family-name"
              error={errors.lastName?.[0]}
            />
          </div>

          <Input
            name="email"
            type="email"
            label="כתובת מייל"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.[0]}
            dir="ltr"
          />

          <Input
            name="phone"
            type="tel"
            label="טלפון (אופציונלי)"
            placeholder="050-0000000"
            autoComplete="tel"
            error={errors.phone?.[0]}
            dir="ltr"
          />

          <div className="flex flex-col gap-1">
            <Input
              name="password"
              type="password"
              label="סיסמה"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.[0]}
              hint="לפחות 8 תווים, אות גדולה אחת וספרה אחת"
            />
          </div>
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg">
        יצירת חשבון
      </Button>

      <p className="text-center text-sm text-text-secondary">
        כבר יש לך חשבון?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-primary hover:underline"
        >
          כניסה
        </Link>
      </p>

      <p className="text-center text-xs text-text-muted">
        בהרשמה אתה מסכים ל
        <Link href="/privacy" className="underline">
          מדיניות הפרטיות
        </Link>{" "}
        ול
        <Link href="/terms" className="underline">
          תנאי השימוש
        </Link>
      </p>
    </form>
  );
}
