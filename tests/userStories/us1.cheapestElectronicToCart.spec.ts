import { test, expect } from '../fixtures';
import { cartSchema } from '../../src/schemas/cart.schema';
import { Product } from '../../src/schemas/product.schema';
import { isInStock } from '../../src/utils/inventoryAssumption';

const TARGET_CATEGORY = 'electronics';
const SHOPPER_USER_ID = 1;
const QUANTITY_TO_ADD = 1;

test.describe('User Story 1: view products & add cheapest in-stock electronics item to cart', () => {
  let cheapestInStockElectronic: Product;

  test('finds the cheapest in-stock product belonging to the electronics category', async ({
    productsApi,
  }) => {
    const res = await productsApi.getByCategory(TARGET_CATEGORY);
    expect(res.status).toBe(200);

    const products = res.data as Product[];

    // AC1: every returned product actually belongs to the category.
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product.category).toBe(TARGET_CATEGORY);
    }

    // AC2: filter down to what our documented stock assumption allows.
    const inStockElectronics = products.filter((p) => isInStock(p.id));
    expect(inStockElectronics.length).toBeGreaterThan(0);

    cheapestInStockElectronic = inStockElectronics.reduce((cheapest, current) =>
      current.price < cheapest.price ? current : cheapest
    );

    expect(isInStock(cheapestInStockElectronic.id)).toBe(true);
  });

  test('adds the cheapest in-stock electronics item to the cart with correct price and quantity', async ({
    productsApi,
    cartsApi,
  }) => {
    expect(cheapestInStockElectronic).toBeDefined(); // depends on previous test running first

    const cartPayload = {
      userId: SHOPPER_USER_ID,
      date: new Date().toISOString().slice(0, 10),
      products: [{ productId: cheapestInStockElectronic.id, quantity: QUANTITY_TO_ADD }],
    };

    const res = await cartsApi.create(cartPayload);
    expect(res.status).toBe(201);

    // AC3 (schema): does the cart response even match the documented shape?
    expect(res.data).toMatchZodSchema(cartSchema);

    // AC3 (quantity): correct line item made it into the cart.
    const cart = res.data as { products: { productId: number; quantity: number }[] };
    const lineItem = cart.products.find((p) => p.productId === cheapestInStockElectronic.id);
    expect(lineItem).toBeDefined();
    expect(lineItem?.quantity).toBe(QUANTITY_TO_ADD);

    // AC3 (price): /carts doesn't store price - "correct price" means the
    // price quoted at selection time still matches the catalogue.
    const productNow = await productsApi.getById(cheapestInStockElectronic.id);
    expect((productNow.data as Product).price).toBe(cheapestInStockElectronic.price);
  });
});
