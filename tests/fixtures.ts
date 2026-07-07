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

/**
 * `base.extend<...>({...})` teaches Playwright two new fixtures:
 * `productsApi` and `cartsApi`. Each one receives Playwright's OWN
 * fixtures (here, `request` - the config-aware one from Step 4/6) and
 * must call `use(...)` with the value tests should actually receive.
 *
 * Every test file from now on imports `test`/`expect` from THIS file,
 * never directly from '@playwright/test' - that's what makes
 * `productsApi`/`cartsApi` available as plain destructured parameters.
 */
export const test = base.extend<ApiFixtures>({
  productsApi: async ({ request }, use) => {
    await use(new ProductsApi(request));
  },
  cartsApi: async ({ request }, use) => {
    await use(new CartsApi(request));
  },
});

/**
 * Custom matcher: expect(data).toMatchZodSchema(productSchema) instead of
 * manually calling .safeParse() and asserting on .success in every test.
 */
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