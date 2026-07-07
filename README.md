# FakeStoreAPI Test Automation Suite (Playwright + TypeScript)

An API test automation project covering FakeStoreAPI's `/products` and
`/carts` endpoints and three user-story-driven workflows for a fictitious
online store, built with Playwright Test + TypeScript.

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Test runner | **Playwright Test** | First-class API testing via `APIRequestContext` - no browser needed. Built-in `webServer` orchestration removed the need for a separate server-management dependency. |
| Language | **TypeScript** | Static typing catches integration mistakes at compile time; paired with zod, gives one source of truth for both runtime validation and static types. |
| Schema validation | **zod** | `z.infer<typeof schema>` derives the TypeScript type from the same object that does runtime validation - no separate interface to keep in sync by hand. |
| Local mock server | **Express** | Deterministic, offline, fast test runs; deliberately mirrors the *real* API's documented (and undocumented) quirks rather than a "nicer" hypothetical API. |
| Config | **dotenv** | One `BASE_URL` env var switches the whole suite between the live API and the local mock. |

## Project structure

```text
fake-store/
├── src/
│   ├── config/config.ts          # BASE_URL / timeout / mock port, from env
│   ├── api/
│   │   ├── apiResult.ts          # shared APIResponse -> {status,data} normaliser
│   │   ├── productsApi.ts        # "API Object" for /products
│   │   └── cartsApi.ts           # "API Object" for /carts
│   ├── schemas/                  # zod schemas + inferred TS types
│   │   ├── product.schema.ts
│   │   └── cart.schema.ts
│   └── utils/
│       ├── testDataFactory.ts    # unique product/clothing payload builder
│       └── inventoryAssumption.ts# documented "in stock" stand-in (see below)
├── mock-server/
│   ├── server.ts                 # Express server, verified against live behaviour
│   └── fixtures/products.ts      # seed data (deterministic "cheapest"/"lowest rated")
├── tests/
│   ├── fixtures.ts               # custom test/expect: productsApi, cartsApi, toMatchZodSchema()
│   ├── contract/
│   │   ├── products.contract.spec.ts   # endpoint-level CRUD regression coverage
│   │   ├── products.negative.spec.ts   # boundary values & missing-field validation gaps
│   │   └── carts.contract.spec.ts      # GET /carts, existence pattern, date-range validation
│   └── userStories/
│       ├── us1.cheapestElectronicToCart.spec.ts
│       ├── us2.addClothingItems.spec.ts
│       └── us3.deleteLowRateProd.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Patterns used

- **API Object pattern** (`ProductsApi`/`CartsApi`): endpoint knowledge lives in one place; test files never build a URL or touch `request` directly.
- **Custom fixtures** (`tests/fixtures.ts`): `productsApi`/`cartsApi` are injected automatically into every test, built on Playwright's own `request` fixture (which is what carries the configured `baseURL`).
- **Schema-first assertions**: response *shape* is checked once, centrally, via zod; individual tests focus on business logic, not field-by-field shape checking.
- **`test.fail()` for genuinely unmet acceptance criteria**: used across all three user stories, each with a specific, verified reason (see below) - encodes desired behaviour so it's monitored, not silently skipped or falsely asserted.

## Running the suite

```bash
npm install
npm run typecheck        # tsc --noEmit
npm run test:live        # against the real https://fakestoreapi.com
npm run test:local       # against the local mock (auto-started via Playwright's webServer)
npm test                 # uses BASE_URL from .env
npm run mock-server      # start the mock manually, e.g. to poke at it with curl
```

## Assumptions & Limitations - and how each was actually verified

This section is the most important part of the project. Every item below was confirmed by directly observing the live API's behaviour (via Playwright, since Cloudflare's bot-challenge blocks plain `curl` against `fakestoreapi.com`) - not assumed from REST convention or from the API's own documentation, both of which turned out to be unreliable at points.

### 1. Nonexistent-id requests return `200` + `null`, not `404`
Verified live: `GET/PUT/DELETE /products/999999999` and `/carts/999999999` all return `200`, with `null` (GET/DELETE) or an echoed body (PUT) - no existence check at all. Notably, this **contradicts FakeStoreAPI's own published docs**, which state accessing a newly-created id "will return you a 404 error." The documentation is stale/wrong relative to the deployed behaviour. The mock server and contract tests were corrected to match the verified live behaviour, not the docs.

### 2. `POST /products` and `POST /carts` return `201`, not `200`
Verified live. Mock server and tests updated to match.

### 3. `POST /products` returns the *same* id on every call
Verified live by calling `POST /products` three times in a row with different payloads - all three returned `id: 21`. Because nothing is really inserted, the "new id" is a stateless calculation (something like current-dataset-length + 1) against a dataset that never changes, so it's identical every time. This breaks the "unique id" half of User Story 2's AC1 - see `us2.addClothingItems.spec.ts`, which tests unique **names** as a real assertion, and unique **ids** as a `test.fail()`.

### 4. No persistence on `POST`/`PUT`/`DELETE`, for both `/products` and `/carts`
Verified live and via the mock: writes and deletes never actually change what subsequent `GET` calls return, for either resource. This underlies most of User Stories 2's and 3's `test.fail()` cases, and User Story 1's cart-persistence `test.fail()` - each ticket describes behaviour a real system should have, which this specific mock API cannot exhibit.

### 5. No stock/quantity field on the product model
The API has no such field at all. `src/utils/inventoryAssumption.ts` supplies one explicit, swappable, deterministic stand-in so User Story 1's "in stock" filter (AC2) is still genuinely exercised, rather than skipped or silently assumed true for every product.

### 6. Zero server-side input validation on `POST /products` - business-critical
Verified live and via the mock: `POST /products` accepts and echoes back *any* JSON body, with no checks at all. Specifically confirmed:
- A payload missing `title`, `price`, and `category` entirely → `201`.
- `price: -10` (negative) → `201`, price returned unchanged.
- `price: 0` (free product boundary) → `201`, price returned unchanged.

This is the most business-relevant finding in this project: in a real storefront backed by this kind of API, nothing would stop a malformed or free-by-accident product from being listed. See `tests/contract/products.negative.spec.ts`.

### 7. `/carts` date-range filtering has genuine server-side validation
Verified live: `GET /carts?startdate=X&enddate=Y` rejects a malformed date with a structured `400` and a specific error message ("date format is not correct. it should be in yyyy-mm-dd format"), while a valid `yyyy-mm-dd` range is accepted. First spotted via a real GitHub issue filed against this API (#85, "Carts not working"), confirmed still live today via direct investigation.

This is the **only** genuine server-side input validation found anywhere in this API - everywhere else (`/products` POST/PUT/DELETE) accepts literally anything (see item 6). Worth noting for anyone extending this suite: don't assume "no validation" as a blanket rule for the whole API - verify per-endpoint, as we did here.

## Coverage summary

| File | Covers |
|---|---|
| `contract/products.contract.spec.ts` | GET/POST/PUT/DELETE happy paths + verified status-code/body quirks from items 1-2 above |
| `contract/products.negative.spec.ts` | Missing required fields, negative price, price=0 boundary - all confirm zero server-side validation |
| `contract/carts.contract.spec.ts` | GET /carts, GET /carts/:id, nonexistent-id pattern, date-range validation (the one real validation rule in this API) |
| `userStories/us1.cheapestElectronicToCart.spec.ts` | Category filter (AC1), documented in-stock assumption (AC2), cart price/quantity correctness (AC3, real) + cart persistence on re-fetch (AC3, `test.fail()`) |
| `userStories/us2.addClothingItems.spec.ts` | Unique names (real, AC1) + unique ids/duplicate-rejection/listing-visibility (3x `test.fail()`, AC1/AC2/AC3) |
| `userStories/us3.deleteLowRateProd.spec.ts` | Lowest-rating selection & deletion response (real, AC1) + listing-removal/404-after-delete (2x `test.fail()`, AC2/AC3) |

Verified: **28/28 tests passing identically against both the local mock server and the live FakeStoreAPI.**

## What I'd add next with more time

- `PUT`/`PATCH`/`DELETE` on `/carts/:id` - behaviour was investigated and confirmed to follow the same non-persistence pattern as