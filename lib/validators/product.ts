import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "שם מוצר חייב להכיל לפחות 2 תווים"),
  nameEn: z.string().optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug יכול להכיל אותיות קטנות, מספרים ומקף בלבד"),
  description: z.string().min(10, "תיאור חייב להכיל לפחות 10 תווים"),
  basePrice: z.number().positive("מחיר חייב להיות חיובי"),
  teamId: z.string().optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  variants: z.array(
    z.object({
      size: z.enum(["S", "M", "L", "XL", "XXL", "3XL"]),
      stock: z.number().int().min(0),
      priceOverride: z.number().positive().optional(),
    })
  ),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
