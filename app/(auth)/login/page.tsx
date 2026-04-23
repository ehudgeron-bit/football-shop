import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "כניסה לחשבון" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">כניסה לחשבון</h1>
        <p className="mt-2 text-sm text-text-secondary">
          ברוך הבא חזרה לFootball Shop
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
