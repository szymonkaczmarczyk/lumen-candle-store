# Lumen

[Polski](README.md) · **English**

> Premium scented candles. Hand-poured in small batches.

Lumen is an online store with eight scented candles: from the catalog and product page, through the cart and Stripe
payment, to a customer account and an admin panel. It works in Polish and English. Every candle has an animated,
swaying flame, and in the product grid the candles light up on hover.

Technically it is a monorepo with two apps: a Next.js 16 frontend (App Router, React 19, Tailwind 4, GSAP) and a
separate Fastify 5 API with PostgreSQL through Prisma 7. Validation and types are shared in the `shared` package.
This is a showcase project: payments work only in Stripe test mode.

![Lumen home page with the lit Ambra Nocturna candle](docs/screenshots/home.jpg)

## Who it is for

- **A small brand with its own product** that wants a store with character instead of a marketplace template. A few
  scents, a few sizes, sales in Poland with courier and parcel locker delivery.
- **Developers** looking for a complete e-commerce example on a current stack: server-side sessions and roles,
  prices calculated from the database, Stripe webhooks with idempotency, unit, integration and e2e tests with
  performance budgets and an accessibility audit.
- **Integrators** who want to pull the catalog or handle orders through the API. Full documentation in
  [`docs/api-documentation.pdf`](docs/api-documentation.pdf).

It is not a multi-store platform or a marketplace: one store, one currency (PLN), shipping only within Poland.

## How it works

```
Browser ──► Next.js (apps/web, port 3300)
              │  SSR/SSG pages, PL without a prefix, EN under /en
              │
              ├──► /api/*  rewrite ──► Fastify (apps/api, port 4300)
              │                          │
              │                          ├──► PostgreSQL 17 (Prisma 7)
              │                          ├──► Stripe (PaymentIntent, webhook)
              │                          └──► Resend or HTML files (emails)
              │
              └──► /admin  panel (same app, separate layout, noindex)

packages/shared  Zod schemas, types, prices and shipping costs used on both sides
```

**The catalog** comes from the API. Server Components fetch products directly from `API_URL`, and the browser talks to
the API through the `/api/*` rewrite, so the session cookie is first-party and no CORS is needed.

**The cart** in the browser holds only variant IDs and quantities. Prices, names and availability always come from
the server (`POST /cart/quote`). The client never sends a price.

**An order** goes like this:

1. The customer fills in the form at `/zamowienie` → `POST /checkout` → Zod validation and a honeypot.
2. The server calculates prices from the database, checks stock, creates a `PENDING` order and a Stripe
   PaymentIntent.
3. The browser shows the Stripe Payment Element (card, BLIK, Przelewy24, Apple Pay, Google Pay).
4. The `payment_intent.succeeded` webhook sets `PAID`, decrements stock and sends a confirmation email. Every Stripe
   event is stored, so a redelivery changes nothing.
5. The confirmation page (`GET /checkout/confirmation`) shows the order and, if the webhook has not arrived yet,
   marks it as paid itself.
6. In the panel the team sets the status to `SHIPPED` (with a tracking number) and `DELIVERED`. Cancelling a paid
   order restores stock.
7. Every 15 minutes the API checks `PENDING` orders older than 24 hours. If the payment did go through (a lost
   webhook), it marks them as paid. If it is still in progress, it waits. Otherwise it cancels the PaymentIntent in
   Stripe and sets the order to `CANCELLED`.

## Features

**Store**

| Path (PL / EN) | What it is |
|---|---|
| `/` · `/en` | Hero with a flame and sparks, featured products in a card stack, scent families pinned to the scroll, a values strip, the "Slow down" grid, manifesto, benefits, brand story |
| `/sklep` · `/en/shop` | All scents with a family filter stored in the URL |
| `/produkt/:slug` · `/en/product/:slug` | Gallery, scent notes, accordions, "Pairs well with", a sticky buy bar with size selection, Product structured data |
| `/zamowienie` · `/en/checkout` | Delivery form (courier or parcel locker), summary, Stripe payment |
| `/konto` · `/en/account` | Order history and saved addresses |
| `/logowanie`, `/rejestracja`, `/nowe-haslo` | Customer account and password reset by email |
| `/o-nas`, `/dostawa`, `/regulamin`, `/polityka-prywatnosci` | Brand page, shipping prices, legal documents |

The cart is a drawer available from every page. Quick add from a tile sends a flame spark to the cart icon.

**The `/admin` panel** (account with the `ADMIN` role)

- **Dashboard**: today's orders, 30-day revenue, orders to ship, low stock variants, latest orders.
- **Orders**: list with a status filter, search (number, email, name) and pagination, details with status changes.
- **Products**: visibility, featuring, prices and stock of every variant.

## Screenshots

### Store

| Scent families | Collection |
|---|---|
| ![Scent family list with a preview of the Neroli o Świcie candle](docs/screenshots/home-families.jpg) | ![Product grid with a family filter and a candle lit on hover](docs/screenshots/shop.jpg) |

| Product page | About |
|---|---|
| ![Figa Śródziemna product page with a gallery and buy bar](docs/screenshots/product.jpg) | ![Brand page with a candle seen from above](docs/screenshots/about.jpg) |

| Cart | Checkout |
|---|---|
| ![Cart drawer with two candles and a free shipping progress bar](docs/screenshots/cart.png) | ![Checkout form with a choice of courier or parcel locker](docs/screenshots/checkout.png) |

| Shipping and returns | Login |
|---|---|
| ![Shipping prices and return policy](docs/screenshots/shipping.png) | ![Customer login screen](docs/screenshots/login.png) |

| Customer account |
|---|
| ![Customer account with order history and a saved address](docs/screenshots/account.png) |

### Admin panel

| Dashboard | Orders |
|---|---|
| ![Dashboard with counters and latest orders](docs/screenshots/admin-dashboard.png) | ![Order list with status filters and search](docs/screenshots/admin-orders.png) |

| Order details | Products |
|---|---|
| ![Order with items, status and delivery address](docs/screenshots/admin-order.png) | ![Editing variant prices and stock](docs/screenshots/admin-products.png) |

Customers and orders in the screenshots are sample data (`@example.com` addresses).

## Getting started

Requirements: Node.js 22 or newer, pnpm 10, Docker (for PostgreSQL).

```bash
pnpm install
pnpm db:up                                   # PostgreSQL 17 in Docker on port 5440
cp apps/api/.env.example apps/api/.env       # fill in COOKIE_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @lumen/api db:deploy           # migrations
pnpm db:seed                                 # 8 scents and the admin account from .env
pnpm dev                                     # web: http://localhost:3300, API: http://localhost:4300
```

Without Stripe keys the store works normally up to the payment step, which shows a message that payments are
unavailable. Without a Resend key emails are saved as HTML files in `apps/api/.mail/`.

**Payments locally**: add Stripe test keys (below), run `pnpm stripe:listen` (Stripe CLI) and copy the printed
`whsec_…` secret to `STRIPE_WEBHOOK_SECRET`. Test card: `4242 4242 4242 4242`, any future date and CVC.

| Script | What it does |
|---|---|
| `pnpm dev` | Web and API in dev mode (Turborepo) |
| `pnpm build` | Production build of all packages |
| `pnpm typecheck` / `pnpm lint` | TypeScript and ESLint across the monorepo |
| `pnpm test` | Vitest tests: `shared` (logic) and `api` (integration tests on the `lumen_test` database) |
| `pnpm --dir apps/web test:e2e` | Playwright: 33 scenarios × desktop and Pixel 7, including axe and Web Vitals budgets |
| `pnpm db:up` / `pnpm db:down` | Start and stop PostgreSQL in Docker |
| `pnpm db:migrate` / `pnpm db:seed` | New Prisma migration / demo data and the admin account |
| `pnpm stripe:listen` | Forwarding Stripe webhooks to the local API |
| `pnpm --dir apps/web render:packshots` | Re-rendering product photos from the 3D scene (needs web and API running) |

E2e tests check the production build at `http://localhost:3301` by default (`next start --port 3301`). The API must
have that address in `ALLOWED_ORIGINS`.

## Configuration

Secrets only in `.env` (API) and `.env.local` (web). Both files are in `.gitignore`, templates in `.env.example`.

**`apps/api/.env`**

| Variable | Description |
|---|---|
| `PORT`, `HOST` | API address, default `4300` and `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL, locally `postgresql://lumen:lumen@localhost:5440/lumen` |
| `TEST_DATABASE_URL` | Separate database for integration tests (`lumen_test`, created when the container starts) |
| `WEB_URL` | Frontend address. Links in emails and the `Origin` header check |
| `ALLOWED_ORIGINS` | Extra allowed origins, comma-separated (e.g. `http://localhost:3301` for e2e) |
| `COOKIE_SECRET` | At least 32 random characters |
| `STRIPE_SECRET_KEY` | Only `sk_test_…`. Empty = payments disabled |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from `stripe listen` or the Stripe dashboard |
| `RESEND_API_KEY` | `re_…`. Empty = emails as files in `apps/api/.mail/` |
| `MAIL_FROM` | Email sender |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by `pnpm db:seed` |

**`apps/web/.env.local`**

| Variable | Description |
|---|---|
| `API_URL` | API address for the Next.js server and the `/api/*` rewrite |
| `NEXT_PUBLIC_SITE_URL` | Full store address: canonical, Open Graph, sitemap, structured data. **Set it before deploying.** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` for the Stripe Payment Element |

### Database

1. `pnpm db:up` starts `postgres:17-alpine` on port 5440 and on first start also creates the `lumen_test` database.
2. `pnpm --filter @lumen/api db:deploy` applies migrations from `apps/api/prisma/migrations`.
3. `pnpm db:seed` loads 8 scents (two sizes each, PL and EN translations, three photos) and creates the admin account.
4. Schema change: edit `apps/api/prisma/schema.prisma` and run `pnpm db:migrate`.

## Structure

```
apps/
  web/                      Next.js 16
    src/app/[locale]/       store pages (PL and EN), app/admin/ panel, app/studio/ render scene (dev only)
    src/components/         home, product, cart, checkout, account, admin, layout, motion (GSAP), three (R3F)
    src/content/legal/      terms and privacy policy
    src/lib/                API, cart (Zustand), session, animations, scent colors
    messages/               pl.json and en.json translations
    e2e/                    Playwright tests
    scripts/                product photo rendering
    public/products/        3D renders: color, neutral, top view, hero
  api/                      Fastify 5
    src/routes/             catalog, cart, checkout, webhooks, auth, account, admin, health
    src/lib/                prices, orders, sessions, passwords, payments, emails
    prisma/                 schema, migrations, seed
    test/                   integration tests (Vitest)
packages/shared/            Zod schemas, types, price formatting, shipping costs
docker/                     PostgreSQL initialization
logo/, favicon/, fonts/     brand source files and font licenses
docs/
  api-documentation.pdf / .html   API documentation
  screenshots/                    screenshots used in the README
```

## Security

- Passwords hashed with argon2id. Login computes a hash even for a non-existent account, so response time does not reveal whether the account exists.
- Session: a random token in an `HttpOnly; SameSite=Lax` cookie (+ `Secure` in production), only its SHA-256 hash in the database, valid for 30 days. A password reset removes all sessions.
- Roles and record access are checked only by the API. A customer sees only their own orders and addresses, others return 404.
- Prices always come from the database. The server accepts only allowed fields (Zod) and never takes a price, role or `userId` from the client.
- Rate limits: 5 per minute for login, registration and password reset, 10 for checkout, 300 globally. A honeypot on public forms.
- Data-changing requests from a foreign `Origin` are rejected (`403`). The Stripe webhook verifies the signature.
- Headers: CSP (no `unsafe-eval`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- API responses contain no hashes, tokens or stack traces. The panel and account pages are `noindex`.

Rate limits are counted in process memory. With several API instances you need a shared store (e.g. Redis).

## Performance

- The home page does not load three.js. The 3D scene is used only to render product photos, and the flames on the
  photos are a light SVG and CSS overlay.
- Photos in WebP, above the fold with `preload` and `fetchPriority="high"`, the rest lazy. Mega menu photos load only
  after hovering "Shop".
- Fonts self-hosted and subset to the needed characters (Alte Haas about 33 kB per style).
- GSAP animations with a `prefers-reduced-motion` variant. The first visit is not animated, so LCP is not delayed.
- E2e tests enforce budgets: CLS below 0.1, LCP below 2.5 s, page transfer below 1.6 MB, no console errors.

## Licenses and disclaimers

- **Alte Haas Grotesk** (Yann Le Coroller): freeware, distribution allowed together with the license file
  (`fonts/licenses/`, a copy in `apps/web/src/fonts/licenses/`). The Polish characters ą ć ę ń ś ź ż were added as
  composite glyphs built from the typeface's own accents.
- **DM Sans**, **DM Mono** and **Pinyon Script** (the founder's signature): SIL Open Font License, from Fontsource.
- Product photos are 3D renders from our own scene (React Three Fiber), no stock photos.
- Company data, prices and content are sample data. The project is a showcase and does not sell anything.

## Documentation

- [`docs/api-documentation.pdf`](docs/api-documentation.pdf) (and the [HTML](docs/api-documentation.html) version):
  all public, customer account and panel endpoints, parameters, request and response examples, error codes, limits.

## License

Code released under the MIT license, see [`LICENSE`](LICENSE). The license does not cover the fonts described above,
which have their own terms.
