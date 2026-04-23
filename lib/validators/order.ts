import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "נא לבחור כתובת למשלוח"),
});

export const createAddressSchema = z.object({
  street: z.string().min(5, "נא להזין כתובת מלאה"),
  city: z.string().min(2, "נא להזין עיר"),
  zipCode: z.string().min(5, "נא להזין מיקוד תקין"),
  isDefault: z.boolean().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
