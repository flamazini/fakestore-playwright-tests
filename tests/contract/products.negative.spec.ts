import { test, expect } from '../fixtures';

test.describe('Products API - negative & boundary cases', () => {
  test('accepts product creation even with required fields missing (documents zero server-side validation)', async ({
    productsApi,
  }) => {
    const res = await productsApi.create({ description: 'missing everything else' });
    expect(res.status).toBe(201);
  });

  test('accepts product creation with a negative price (documents zero server-side validation)', async ({
    productsApi,
  }) => {
    const res = await productsApi.create({
      title: 'Invalid priced item',
      price: -10,
      category: 'electronic',
      description: 'price should not be allowed to be negative',
      image: 'https://i.pravatar.cc',
    });
    expect(res.status).toBe(201);
    expect((res.data as { price: number }).price).toBe(-10);
  });

  test('accepts product creation with a price of exactly 0 - business-critical boundary (documents zero server-side validation)', async ({
    productsApi,
  }) => {
    const res = await productsApi.create({
      title: 'Free Product Boundary Test',
      price: 0,
      category: 'electronic',
      description: 'Testing the price=0 boundary',
      image: 'https://i.pravatar.cc',
    });
    expect(res.status).toBe(201);
    expect((res.data as { price: number }).price).toBe(0);
  });
});