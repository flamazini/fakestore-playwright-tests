import { test as base, expect as baseExpect } from '@playwright/test';
import { ZodSchema } from 'zod';
import { ProductsApi } from '../src/api/productsApi';
import { CartsApi } from '../src/api/cartsApi';

type ApiFixtures = {
  productsApi: ProductsApi;
  cartsApi: CartsApi;
};

// Declaration merging so TypeScript knows about our custom matcher below.
declare module '@playwright/test' {
  interface Matchers<R, T> {
    toMatchZodSchema(schema: ZodSchema): R;
  }
}

export const test = base.extend<ApiFixtures>({
  productsApi: async ({ request }, use) => {
    await use(new ProductsApi(request));
  },
  cartsApi: async ({ request }, use) => {
    await use(new CartsApi(request));
  },
});

export const expect = baseExpect.extend({
  toMatchZodSchema(received: unknown, schema: ZodSchema) {
    const result = schema.safeParse(received);
    if (result.success) {
      return { pass: true, message: () => 'expected data not to match schema' };
    }
    return {
      pass: false,
      message: () =>
        `expected data to match schema, but got:\n${JSON.stringify(result.error.format(), null, 2)}`,
    };
  },
});