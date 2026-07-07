export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating?: { rate: number; count: number };
}

/**
 * Seed data, deliberately chosen so "cheapest electronics" and "lowest
 * rated product" each have exactly one correct answer - that's what makes
 * the User Story tests deterministic instead of "usually passes".
 */
export const products: Product[] = [
  { id: 1, title: 'Slim Fit Denim Jacket', price: 55.99, description: 'Classic denim jacket.', image: 'https://i.pravatar.cc/1', category: "men's clothing", rating: { rate: 3.9, count: 120 } },
  { id: 2, title: 'Wireless Bluetooth Headphones', price: 24.99, description: 'Over-ear wireless headphones.', image: 'https://i.pravatar.cc/2', category: 'electronics', rating: { rate: 4.5, count: 300 } },
  { id: 3, title: '4K Action Camera', price: 89.5, description: 'Compact waterproof action camera.', image: 'https://i.pravatar.cc/3', category: 'electronics', rating: { rate: 3.5, count: 45 } },
  { id: 4, title: 'Silver Hoop Earrings', price: 15.0, description: 'Sterling silver hoop earrings.', image: 'https://i.pravatar.cc/4', category: 'jewelery', rating: { rate: 4.1, count: 60 } },
  { id: 5, title: 'Portable Bluetooth Speaker', price: 19.99, description: 'Compact speaker with 10hr battery.', image: 'https://i.pravatar.cc/5', category: 'electronics', rating: { rate: 2.3, count: 15 } },
  { id: 6, title: "Women's Floral Summer Dress", price: 39.99, description: 'Lightweight floral dress.', image: 'https://i.pravatar.cc/6', category: "women's clothing", rating: { rate: 4.7, count: 210 } },
  { id: 7, title: 'Gold Plated Necklace', price: 45.0, description: 'Elegant gold plated necklace.', image: 'https://i.pravatar.cc/7', category: 'jewelery', rating: { rate: 4.0, count: 90 } },
  { id: 8, title: 'Noise Cancelling Earbuds', price: 34.99, description: 'True wireless earbuds with ANC.', image: 'https://i.pravatar.cc/8', category: 'electronics', rating: { rate: 4.8, count: 500 } },
  { id: 9, title: "Men's Slim Fit Chinos", price: 29.99, description: 'Comfortable slim fit chinos.', image: 'https://i.pravatar.cc/9', category: "men's clothing", rating: { rate: 3.2, count: 33 } },
  { id: 10, title: 'Smart Fitness Tracker', price: 22.5, description: 'Tracks steps, heart rate and sleep.', image: 'https://i.pravatar.cc/10', category: 'electronics', rating: { rate: 1.9, count: 12 } },
];