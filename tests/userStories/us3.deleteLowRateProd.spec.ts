import { test, expect } from '../fixtures';
import { Product } from '../../src/schemas/product.schema';

test.describe('User Story 3: delete the product with the lowest rating', () => {
  let lowestRatedProduct: Product;

  test('identifies the product with the lowest customer rating', async ({ productsApi }) => {
    const res = await productsApi.getAll();
    expect(res.status).toBe(200);

    const ratedProducts = (res.data as Product[]).filter(
      (p) => p.rating && typeof p.rating.rate === 'number'
    );
    expect(ratedProducts.length).toBeGreaterThan(0);

    lowestRatedProduct = ratedProducts.reduce((lowest, current) => {
      if (current.rating!.rate < lowest.rating!.rate) return current;
      if (current.rating!.rate === lowest.rating!.rate && current.id < lowest.id) return current;
      return lowest;
    });

    expect(lowestRatedProduct).toBeDefined();
  });

  test('deletes the identified lowest-rated product and returns it in the response', async ({
    productsApi,
  }) => {
    expect(lowestRatedProduct).toBeDefined();

    const res = await productsApi.remove(lowestRatedProduct.id);

    expect(res.status).toBe(200);
    expect((res.data as Product).id).toBe(lowestRatedProduct.id);
  });

  test('the deleted product no longer appears in the product listing (documents a known API limitation)', async ({
    productsApi,
  }) => {
    test.fail();

    const listRes = await productsApi.getAll();
    const stillPresent = (listRes.data as Product[]).some((p) => p.id === lowestRatedProduct.id);

    expect(stillPresent).toBe(false);
  });

  test('retrieving the deleted product by id returns 404 (documents a known API limitation)', async ({
    productsApi,
  }) => {
    test.fail();

    const res = await productsApi.getById(lowestRatedProduct.id);
    expect(res.status).toBe(404);
  });
});