import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "הרשמה" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">יצירת חשבון חדש</h1>
        <p className="mt-2 text-sm text-text-secondary">
          הצטרף לFoodball Shop וקבל גישה לכל המוצרים
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
