import { z } from 'zod';

export const ratingSchema = z.object({
  rate: z.number().min(0).max(5),
  count: z.number().int().min(0),
});

export const productSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  description: z.string(),
  image: z.string(),
  rating: ratingSchema.optional(),
});

export const productListSchema = z.array(productSchema);

export type Product = z.infer<typeof productSchema>;