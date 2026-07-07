import { z } from 'zod';

export const cartLineItemSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1),
});

export const cartSchema = z.object({
  id: z.number().int(),
  userId: z.number().int().optional(),
  date: z.string().optional(),
  products: z.array(cartLineItemSchema).default([]),
});

export type Cart = z.infer<typeof cartSchema>;