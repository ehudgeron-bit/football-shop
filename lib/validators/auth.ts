import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
});

export const registerSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z
    .string()
    .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
    .regex(/[A-Z]/, "סיסמה חייבת להכיל אות גדולה אחת לפחות")
    .regex(/[0-9]/, "סיסמה חייבת להכיל ספרה אחת לפחות"),
  firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
