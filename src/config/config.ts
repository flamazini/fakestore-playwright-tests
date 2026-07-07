import 'dotenv/config';

export const config = {
  baseUrl: process.env.BASE_URL || 'https://fakestoreapi.com',
  requestTimeout: Number(process.env.REQUEST_TIMEOUT || 10000),
  mockPort: Number(process.env.MOCK_PORT || 3002),
};