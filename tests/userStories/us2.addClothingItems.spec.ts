import { test, expect } from '../fixtures';
import { productSchema, Product } from '../../src/schemas/product.schema';
import { buildClothingItems, ProductPayload } from '../../src/utils/testDataFactory';

test.describe('User Story 2: add three new clothing items to the catalogue', () => {
  const newClothingItems: ProductPayload[] = buildClothingItems(3);
  const createdProducts: Product[] = [];

  test('successfully creates three clothing products, each with a unique name', async ({
    productsApi,
  }) => {
    for (const item of newClothingItems) {
      const res = await productsApi.create(item);

      expect(res.status).toBe(201);
      expect(res.data).toMatchZodSchema(productSchema);

      const created = res.data as Product;
      expect(created.title).toBe(item.title);
      createdProducts.push(created);
    }

    // AC1 (names): genuinely testable - our factory guarantees unique
    // titles, and the API echoes back whatever title we send.
    const titles = createdProducts.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  test('each created product receives a unique id (documents a known API limitation)', async ({
    productsApi,
  }) => {
    // desired per AC1; live-verified that this API returns the SAME
    // computed "fake id" on every POST call, since nothing is ever really
    // inserted - see debug investigation in chat history / README.
    test.fail();

    const results: number[] = [];
    for (const item of newClothingItems) {
      const res = await productsApi.create(item);
      results.push((res.data as Product).id);
    }

    expect(new Set(results).size).toBe(results.length);
  });

  test('rejects creation of a product whose name duplicates an existing product (documents a known API limitation)', async ({
    productsApi,
  }) => {
    test.fail(); // desired per AC2; this API has no uniqueness validation

    const duplicateTitleItem = { ...newClothingItems[0] };
    const res = await productsApi.create(duplicateTitleItem);

    expect(res.status).toBe(409);
  });

  test('newly created items are immediately visible via GET /products (documents a known API limitation)', async ({
    productsApi,
  }) => {
    test.fail(); // desired per AC3; this API does not persist writes

    const created = createdProducts[0];
    const listRes = await productsApi.getAll();
    const found = (listRes.data as Product[]).find(
      (p) => p.id === created.id && p.title === created.title
    );

    expect(found).toBeDefined();
  });
});