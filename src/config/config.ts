import 'dotenv/config';

/**
 * One place that reads environment variables. Every other file that needs
 * the base URL imports THIS, never `process.env` directly. That's what
 * lets us flip the entire suite between the live API and the local mock
 * with a single env var.
 */
export const config = {
  baseUrl: process.env.BASE_URL || 'https://fakestoreapi.com',
  requestTimeout: Number(process.env.REQUEST_TIMEOUT || 10000),
  mockPort: Number(process.env.MOCK_PORT || 3002),
};