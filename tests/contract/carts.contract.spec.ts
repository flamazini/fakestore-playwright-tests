import { test, expect } from '../fixtures';

test.describe('Carts API - contract tests', () => {
  test('GET /carts returns 200 and a list of carts', async ({ request }) => {
    const res = await request.get('/carts');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /carts/:id returns 200 for an existing cart', async ({ request }) => {
    const res = await request.get('/carts/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
  });

  test('GET /carts/:id returns 200 and null for a nonexistent id (same pattern as /products)', async ({
    request,
  }) => {
    const res = await request.get('/carts/999999999');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toBeNull();
  });

  test('GET /carts?startdate&enddate accepts a valid yyyy-mm-dd date range', async ({ request }) => {
    const res = await request.get('/carts?startdate=2020-10-03&enddate=2020-12-12');
    expect(res.status()).toBe(200);
  });

  test('GET /carts?startdate&enddate rejects a malformed date with a structured 400 - the ONLY real server-side validation found in this API', async ({
    request,
  }) => {
    const res = await request.get('/carts?startdate=03-10-2020&enddate=not-a-date');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('yyyy-mm-dd');
  });
});