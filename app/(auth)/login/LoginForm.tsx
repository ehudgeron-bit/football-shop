"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { loginSchema } from "@/lib/validators/auth";

type FieldErrors = { email?: string[]; password?: string[] };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Client-side validation first
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        toast("אימייל או סיסמה שגויים", "error");
        return;
      }

      // Fire-and-forget — merge guest cart into user cart
      fetch("/api/cart/merge", { method: "POST" }).catch(() => {});

      toast("כניסה בוצעה בהצלחה", "success");
      router.push(callbackUrl);
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
          <Input
            name="email"
            type="email"
            label="כתובת מייל"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.[0]}
            dir="ltr"
          />
          <div className="flex flex-col gap-1">
            <Input
              name="password"
              type="password"
              label="סיסמה"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.[0]}
            />
            <Link
              href="/forgot-password"
              className="self-end text-xs text-text-secondary hover:text-text-primary"
            >
              שכחת סיסמה?
            </Link>
          </div>
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg">
        כניסה
      </Button>

      <p className="text-center text-sm text-text-secondary">
        אין לך חשבון עדיין?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-primary hover:underline"
        >
          הרשמה
        </Link>
      </p>
    </form>
  );
}
