/**
 * FakeStoreAPI's product model has no stock/quantity field. This is a
 * single, explicit, swappable source of truth for assumed stock levels so
 * User Story 1's "in stock" filter is genuinely exercised - not a claim
 * about the real API's behaviour.
 */
export function isInStock(productId: number): boolean {
  return productId % 7 !== 0; // arbitrary, deterministic rule
}