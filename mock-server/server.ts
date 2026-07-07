import express, { Application, Request, Response } from 'express';
import { products as seedProducts, Product } from './fixtures/products';

export function createServer(): Application {
  const app = express();
  app.use(express.json());

  // Fresh copy per server instance, so restarting the server resets state.
  const products: Product[] = seedProducts.map((p) => ({ ...p }));

  app.get('/products', (req: Request, res: Response) => {
    let result = [...products];
    const { sort, limit } = req.query;

    if (sort === 'desc') result.reverse();
    if (limit) result = result.slice(0, Number(limit));

    res.status(200).json(result);
  });

  app.get('/products/categories', (_req: Request, res: Response) => {
    const categories = [...new Set(products.map((p) => p.category))];
    res.status(200).json(categories);
  });

  app.get('/products/category/:category', (req: Request, res: Response) => {
    let result = products.filter((p) => p.category === req.params.category);
    if (req.query.sort === 'desc') result.reverse();
    res.status(200).json(result);
  });

  app.get('/products/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id) || null;
  // Matches live FakeStoreAPI: no existence check, returns 200 with null
  // for a nonexistent id rather than 404.
  res.status(200).json(product);
});

app.post('/products', (req: Request, res: Response) => {
  const body = req.body || {};
  // Matches live FakeStoreAPI: NO server-side validation at all - any
  // body, including one missing required fields, is accepted and echoed.
  const fakeId = products.length + 1;
  res.status(201).json({ id: fakeId, ...body });
});

  app.put('/products/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  // Matches live FakeStoreAPI: no existence check on update either.
  res.status(200).json({ id, ...req.body });
});

  app.delete('/products/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id) || null;
  // Matches live FakeStoreAPI: no existence check, returns 200 with null.
  res.status(200).json(product);
});

  // Minimal /carts support for User Story 1.
  let nextCartId = 1;
  app.post('/carts', (req: Request, res: Response) => {
    res.status(201).json({ id: nextCartId++, ...req.body });
  });

  return app;
}

if (require.main === module) {
  const PORT = Number(process.env.MOCK_PORT) || 3002;
  createServer().listen(PORT, () => {
    console.log(`Mock FakeStoreAPI server listening on http://localhost:${PORT}`);
  });
}