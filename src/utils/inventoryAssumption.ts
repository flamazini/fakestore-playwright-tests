export function isInStock(productId: number): boolean {
  return productId % 7 !== 0; // arbitrary, deterministic rule
}