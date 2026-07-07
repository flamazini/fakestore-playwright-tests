import { test, expect } from '../fixtures';
import { productSchema, productListSchema } from '../../src/schemas/product.schema';
import { buildProduct } from '../../src/utils/testDataFactory';

test.describe('Products API - contract tests', () => {
  let existingProductId: number;

  test.beforeAll(async ({ request }) => {
    const res = await request.get('/products');
    const data = await res.json();
    existingProductId = data[0].id;
  });

  test.describe('GET /products', () => {
    test('returns 200 and a list matching the documented schema', async ({ productsApi }) => {
      const res = await productsApi.getAll();

      expect(res.status).toBe(200);
      expect(res.data).toMatchZodSchema(productListSchema);
    });

    test('honours the "limit" query parameter', async ({ productsApi }) => {
      const res = await productsApi.getAll({ limit: 3 });
      expect((res.data as unknown[]).length).toBeLessThanOrEqual(3);
    });
  });

  test.describe('GET /products/:id', () => {
    test('returns 200 and the matching product for a valid id', async ({ productsApi }) => {
      const res = await productsApi.getById(existingProductId);

      expect(res.status).toBe(200);
      expect(res.data).toMatchZodSchema(productSchema);
    });

    test('returns 200 and null for a product id that does not exist (documented API quirk, not real REST convention)', async ({ productsApi }) => {
      const res = await productsApi.getById(999999999);

      expect(res.status).toBe(200);
    expect(res.data).toBeNull();
    });
  });

  test.describe('POST /products', () => {
    test('returns 201 and echoes back the created product with a new id', async ({ productsApi }) => {
      const payload = buildProduct();
      const res = await productsApi.create(payload);

      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({ title: payload.title, price: payload.price });
    });
  });

  test.describe('PUT /products/:id', () => {
    test('returns 200 and echoes the updated fields', async ({ productsApi }) => {
      const payload = buildProduct({ title: 'Updated Title', price: 42 });
      const res = await productsApi.update(existingProductId, payload);

      expect(res.status).toBe(200);
      expect((res.data as any).title).toBe('Updated Title');
    });

    test('returns 200 for a product id that does not exist (documented API quirk - no server-side existence check)', async ({ productsApi }) => {
      const res = await productsApi.update(999999999, buildProduct());
      expect(res.status).toBe(200);
    });
  });

  test.describe('DELETE /products/:id', () => {
    test('returns 200 and the deleted product for an existing id', async ({ productsApi }) => {
      const res = await productsApi.remove(existingProductId);

      expect(res.status).toBe(200);
      expect((res.data as any).id).toBe(existingProductId);
    });

    test('returns 200 and null for a product id that does not exist (documented API quirk)', async ({ productsApi }) => {
      const res = await productsApi.remove(999999999);
      expect(res.status).toBe(200);
      expect(res.data).toBeNull();
    });
  });
});