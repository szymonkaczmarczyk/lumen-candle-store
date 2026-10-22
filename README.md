# Lumen

**Polski** · [English](README.en.md)

> Świece zapachowe premium. Wylewane ręcznie, w małych partiach.

Lumen to sklep internetowy z ośmioma świecami zapachowymi: od katalogu i karty produktu, przez koszyk i
płatność Stripe, po konto klienta i panel administracyjny. Całość działa po polsku i po angielsku. Każda
świeca ma animowany, kołyszący się płomień, a w siatce produktów świece zapalają się po najechaniu.

Technicznie to monorepo z dwiema aplikacjami: front w Next.js 16 (App Router, React 19, Tailwind 4, GSAP)
i osobne API w Fastify 5 z PostgreSQL przez Prisma 7. Walidacja i typy są wspólne w pakiecie `shared`.
Projekt jest pokazowy: płatności działają wyłącznie w trybie testowym Stripe.

![Strona główna Lumen z zapaloną świecą Ambra Nocturna](docs/screenshots/home.jpg)

## Dla kogo

- **Dla małej marki z własnym produktem**, która chce sklepu z charakterem zamiast szablonu z marketplace.
  Kilka zapachów, kilka rozmiarów, sprzedaż w Polsce z kurierem i paczkomatem.
- **Dla deweloperów**, którzy szukają kompletnego przykładu e-commerce na aktualnym stosie: sesje
  i role po stronie serwera, ceny liczone z bazy, webhooki Stripe z idempotencją, testy jednostkowe,
  integracyjne i e2e z budżetami wydajności i audytem dostępności.
- **Dla integratorów**, którzy chcą pobierać katalog albo obsługiwać zamówienia przez API. Pełna
  dokumentacja w [`docs/api-documentation.pdf`](docs/api-documentation.pdf).

To nie jest platforma wielosklepowa ani marketplace: jeden sklep, jedna waluta (PLN), wysyłka tylko w Polsce.

## Jak to działa

```
Przeglądarka ──► Next.js (apps/web, port 3300)
                   │  strony SSR/SSG, PL bez prefiksu, EN pod /en
                   │
                   ├──► /api/*  rewrite ──► Fastify (apps/api, port 4300)
                   │                          │
                   │                          ├──► PostgreSQL 17 (Prisma 7)
                   │                          ├──► Stripe (PaymentIntent, webhook)
                   │                          └──► Resend albo pliki HTML (maile)
                   │
                   └──► /admin  panel (ta sama aplikacja, osobny layout, noindex)

packages/shared  schematy Zod, typy, ceny i koszty dostawy używane po obu stronach
```

**Katalog** pochodzi z API. Server Components pobierają produkty bezpośrednio z `API_URL`, a przeglądarka
rozmawia z API przez rewrite `/api/*`, więc ciasteczko sesji jest first-party i nie trzeba CORS.

**Koszyk** w przeglądarce trzyma tylko identyfikatory wariantów i ilości. Ceny, nazwy i dostępność zawsze
przychodzą z serwera (`POST /cart/quote`). Klient nigdy nie wysyła ceny.

**Zamówienie** przechodzi taką drogę:

1. Klient wypełnia formularz na `/zamowienie` → `POST /checkout` → walidacja Zod i honeypot.
2. Serwer liczy ceny z bazy, sprawdza stany, tworzy zamówienie `PENDING` i PaymentIntent w Stripe.
3. Przeglądarka pokazuje Stripe Payment Element (karta, BLIK, Przelewy24, Apple Pay, Google Pay).
4. Webhook `payment_intent.succeeded` ustawia `PAID`, zdejmuje stany magazynowe i wysyła mail z potwierdzeniem.
   Każde zdarzenie Stripe jest zapisywane, więc ponowne doręczenie niczego nie zmienia.
5. Strona potwierdzenia (`GET /checkout/confirmation`) pokazuje zamówienie i, jeśli webhook jeszcze nie
   dotarł, sama oznacza je jako opłacone.
6. W panelu zespół zmienia status na `SHIPPED` (z numerem przesyłki) i `DELIVERED`. Anulowanie opłaconego
   zamówienia przywraca stany magazynowe.
7. Co 15 minut API sprawdza zamówienia `PENDING` starsze niż 24 godziny. Jeśli płatność jednak przeszła
   (zgubiony webhook), oznacza je jako opłacone. Jeśli jest w trakcie, czeka. W pozostałych przypadkach
   anuluje PaymentIntent w Stripe i ustawia zamówienie na `CANCELLED`.

## Funkcje

**Sklep**

| Adres (PL / EN) | Co to jest |
|---|---|
| `/` · `/en` | Hero z płomieniem i iskrami, polecane w stosie kart, rodziny zapachów przypięte do scrolla, pas wartości, siatka „Zwolnij”, manifest, korzyści, historia marki |
| `/sklep` · `/en/shop` | Wszystkie zapachy z filtrem rodziny zapisywanym w adresie |
| `/produkt/:slug` · `/en/product/:slug` | Galeria, nuty zapachowe, akordeony, „Dobrze łączy się z”, przyklejony pasek zakupu z wyborem rozmiaru, dane strukturalne Product |
| `/zamowienie` · `/en/checkout` | Formularz dostawy (kurier albo paczkomat), podsumowanie, płatność Stripe |
| `/konto` · `/en/account` | Historia zamówień i zapisane adresy |
| `/logowanie`, `/rejestracja`, `/nowe-haslo` | Konto klienta i reset hasła mailem |
| `/o-nas`, `/dostawa`, `/regulamin`, `/polityka-prywatnosci` | Strona marki, cennik wysyłek, dokumenty prawne |

Koszyk to szuflada dostępna z każdej strony. Szybkie dodawanie z kafla wysyła iskrę płomienia do ikony koszyka.

**Panel `/admin`** (konto z rolą `ADMIN`)

- **Pulpit**: zamówienia z dzisiaj, przychód z 30 dni, zamówienia do wysłania, warianty z niskim stanem, ostatnie zamówienia.
- **Zamówienia**: lista z filtrem statusu, wyszukiwarką (numer, e-mail, nazwisko) i stronicowaniem, szczegóły ze zmianą statusu.
- **Produkty**: widoczność, wyróżnienie, ceny i stany magazynowe każdego wariantu.

## Zrzuty ekranu

### Sklep

| Rodziny zapachów | Kolekcja |
|---|---|
| ![Lista rodzin zapachów z podglądem świecy Neroli o Świcie](docs/screenshots/home-families.jpg) | ![Siatka produktów z filtrem rodzin i zapaloną świecą po najechaniu](docs/screenshots/shop.jpg) |

| Karta produktu | O nas |
|---|---|
| ![Karta Figa Śródziemna z galerią i paskiem zakupu](docs/screenshots/product.jpg) | ![Strona o marce ze świecą widzianą z góry](docs/screenshots/about.jpg) |

| Koszyk | Zamówienie |
|---|---|
| ![Szuflada koszyka z dwiema świecami i paskiem darmowej wysyłki](docs/screenshots/cart.png) | ![Formularz zamówienia z wyborem kuriera lub paczkomatu](docs/screenshots/checkout.png) |

| Dostawa i zwroty | Logowanie |
|---|---|
| ![Cennik wysyłek i zasady zwrotów](docs/screenshots/shipping.png) | ![Ekran logowania klienta](docs/screenshots/login.png) |

| Konto klienta |
|---|
| ![Konto klienta z historią zamówień i zapisanym adresem](docs/screenshots/account.png) |

### Panel administracyjny

| Pulpit | Zamówienia |
|---|---|
| ![Pulpit z licznikami i ostatnimi zamówieniami](docs/screenshots/admin-dashboard.png) | ![Lista zamówień z filtrami statusów i wyszukiwarką](docs/screenshots/admin-orders.png) |

| Szczegóły zamówienia | Produkty |
|---|---|
| ![Zamówienie z pozycjami, statusem i adresem dostawy](docs/screenshots/admin-order.png) | ![Edycja cen i stanów wariantów](docs/screenshots/admin-products.png) |

Klienci i zamówienia na zrzutach są przykładowe (adresy `@example.com`).

## Uruchomienie

Wymagane: Node.js 22 lub nowszy, pnpm 10, Docker (dla PostgreSQL).

```bash
pnpm install
pnpm db:up                                   # PostgreSQL 17 w Dockerze na porcie 5440
cp apps/api/.env.example apps/api/.env       # uzupełnij COOKIE_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @lumen/api db:deploy           # migracje
pnpm db:seed                                 # 8 zapachów i konto admina z .env
pnpm dev                                     # web: http://localhost:3300, API: http://localhost:4300
```

Bez kluczy Stripe sklep działa normalnie aż do kroku płatności, który pokazuje komunikat o niedostępnych
płatnościach. Bez klucza Resend maile zapisują się jako pliki HTML w `apps/api/.mail/`.

**Płatności lokalnie**: dodaj klucze testowe Stripe (niżej), uruchom `pnpm stripe:listen` (Stripe CLI)
i skopiuj wypisany sekret `whsec_…` do `STRIPE_WEBHOOK_SECRET`. Karta testowa: `4242 4242 4242 4242`,
dowolna przyszła data i CVC.

| Skrypt | Co robi |
|---|---|
| `pnpm dev` | Web i API w trybie deweloperskim (Turborepo) |
| `pnpm build` | Build produkcyjny wszystkich pakietów |
| `pnpm typecheck` / `pnpm lint` | TypeScript i ESLint w całym monorepo |
| `pnpm test` | Testy Vitest: `shared` (logika) i `api` (integracyjne na bazie `lumen_test`) |
| `pnpm --dir apps/web test:e2e` | Playwright: 33 scenariusze × desktop i Pixel 7, w tym axe i budżety Web Vitals |
| `pnpm db:up` / `pnpm db:down` | Start i stop PostgreSQL w Dockerze |
| `pnpm db:migrate` / `pnpm db:seed` | Nowa migracja Prisma / dane demo i konto admina |
| `pnpm stripe:listen` | Przekierowanie webhooków Stripe na lokalne API |
| `pnpm --dir apps/web render:packshots` | Ponowne renderowanie zdjęć produktów ze sceny 3D (wymaga działającego web i API) |

Testy e2e domyślnie sprawdzają build produkcyjny na `http://localhost:3301`
(`next start --port 3301`). API musi mieć ten adres w `ALLOWED_ORIGINS`.

## Konfiguracja

Sekrety tylko w `.env` (API) i `.env.local` (web). Oba pliki są w `.gitignore`, wzory w `.env.example`.

**`apps/api/.env`**

| Zmienna | Opis |
|---|---|
| `PORT`, `HOST` | Adres API, domyślnie `4300` i `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL, lokalnie `postgresql://lumen:lumen@localhost:5440/lumen` |
| `TEST_DATABASE_URL` | Osobna baza dla testów integracyjnych (`lumen_test`, tworzona przy starcie kontenera) |
| `WEB_URL` | Adres frontu. Linki w mailach i kontrola nagłówka `Origin` |
| `ALLOWED_ORIGINS` | Dodatkowe dozwolone pochodzenia, po przecinku (np. `http://localhost:3301` dla e2e) |
| `COOKIE_SECRET` | Co najmniej 32 losowe znaki |
| `STRIPE_SECRET_KEY` | Tylko `sk_test_…`. Puste = płatności wyłączone |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` z `stripe listen` albo z panelu Stripe |
| `RESEND_API_KEY` | `re_…`. Puste = maile jako pliki w `apps/api/.mail/` |
| `MAIL_FROM` | Nadawca maili |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Konto admina tworzone przez `pnpm db:seed` |

**`apps/web/.env.local`**

| Zmienna | Opis |
|---|---|
| `API_URL` | Adres API dla serwera Next.js i rewrite `/api/*` |
| `NEXT_PUBLIC_SITE_URL` | Pełny adres sklepu: canonical, Open Graph, sitemap, dane strukturalne. **Ustaw przed wdrożeniem.** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` do Stripe Payment Element |

### Baza danych

1. `pnpm db:up` uruchamia `postgres:17-alpine` na porcie 5440 i przy pierwszym starcie tworzy też bazę `lumen_test`.
2. `pnpm --filter @lumen/api db:deploy` nakłada migracje z `apps/api/prisma/migrations`.
3. `pnpm db:seed` wgrywa 8 zapachów (po dwa rozmiary, tłumaczenia PL i EN, trzy zdjęcia) i zakłada konto admina.
4. Zmiana schematu: edytuj `apps/api/prisma/schema.prisma` i uruchom `pnpm db:migrate`.

## Struktura

```
apps/
  web/                      Next.js 16
    src/app/[locale]/       strony sklepu (PL i EN), app/admin/ panel, app/studio/ scena do renderów (tylko dev)
    src/components/         home, product, cart, checkout, account, admin, layout, motion (GSAP), three (R3F)
    src/content/legal/      regulamin i polityka prywatności
    src/lib/                API, koszyk (Zustand), sesja, animacje, kolory zapachów
    messages/               tłumaczenia pl.json i en.json
    e2e/                    testy Playwright
    scripts/                render zdjęć produktów
    public/products/        rendery 3D: kolor, neutralne, z góry, hero
  api/                      Fastify 5
    src/routes/             catalog, cart, checkout, webhooks, auth, account, admin, health
    src/lib/                ceny, zamówienia, sesje, hasła, płatności, maile
    prisma/                 schemat, migracje, seed
    test/                   testy integracyjne (Vitest)
packages/shared/            schematy Zod, typy, formatowanie cen, koszty dostawy
docker/                     inicjalizacja PostgreSQL
logo/, favicon/, fonts/     źródłowe pliki marki i licencje fontów
docs/
  api-documentation.pdf / .html   dokumentacja API
  screenshots/                    zrzuty ekranu używane w README
```

## Bezpieczeństwo

- Hasła hashowane argon2id. Logowanie liczy hash także dla nieistniejącego konta, żeby czas odpowiedzi nie zdradzał, czy konto istnieje.
- Sesja: losowy token w ciasteczku `HttpOnly; SameSite=Lax` (+ `Secure` na produkcji), w bazie tylko skrót SHA-256, ważna 30 dni. Reset hasła usuwa wszystkie sesje.
- Role i dostęp do rekordów sprawdza wyłącznie API. Klient widzi tylko swoje zamówienia i adresy, cudze dają 404.
- Ceny zawsze z bazy. Serwer przyjmuje tylko dozwolone pola (Zod) i nigdy nie bierze od klienta ceny, roli ani `userId`.
- Limity żądań: 5 na minutę na logowanie, rejestrację i reset hasła, 10 na checkout, 300 globalnie. Honeypot na formularzach publicznych.
- Żądania zmieniające dane z obcego `Origin` są odrzucane (`403`). Webhook Stripe weryfikuje podpis.
- Nagłówki: CSP (bez `unsafe-eval`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- Odpowiedzi API bez hashy, tokenów i stack trace. Panel i strony konta mają `noindex`.

Limity żądań są liczone w pamięci procesu. Przy kilku instancjach API potrzebny jest wspólny magazyn (np. Redis).

## Wydajność

- Strona główna nie ładuje three.js. Scena 3D służy tylko do renderowania zdjęć produktów, a płomienie
  na zdjęciach to lekka nakładka SVG i CSS.
- Zdjęcia w WebP, nad zakładką z `preload` i `fetchPriority="high"`, reszta leniwie. Zdjęcia mega panelu
  ładują się dopiero po najechaniu na „Sklep”.
- Fonty hostowane lokalnie i przycięte do potrzebnych znaków (Alte Haas ok. 33 kB na krój).
- Animacje GSAP z wariantem dla `prefers-reduced-motion`. Pierwsze wejście na stronę nie jest animowane, żeby nie opóźniać LCP.
- Testy e2e pilnują budżetów: CLS poniżej 0,1, LCP poniżej 2,5 s, transfer strony poniżej 1,6 MB, brak błędów w konsoli.

## Licencje i zastrzeżenia

- **Alte Haas Grotesk** (Yann Le Coroller): freeware, dystrybucja dozwolona razem z plikiem licencji
  (`fonts/licenses/`, kopia w `apps/web/src/fonts/licenses/`). Polskie znaki ą ć ę ń ś ź ż zostały
  dołożone jako glify złożone z akcentów samego kroju.
- **DM Sans**, **DM Mono** i **Pinyon Script** (podpis założyciela): SIL Open Font License, z Fontsource.
- Zdjęcia produktów to rendery 3D z własnej sceny (React Three Fiber), bez zdjęć stockowych.
- Dane firmy, ceny i treści są przykładowe. Projekt jest pokazowy i nie prowadzi sprzedaży.

## Dokumentacja

- [`docs/api-documentation.pdf`](docs/api-documentation.pdf) (i wersja [HTML](docs/api-documentation.html)):
  wszystkie endpointy publiczne, konta klienta i panelu, parametry, przykłady żądań i odpowiedzi, kody błędów, limity.

## Licencja

Kod udostępniony na licencji MIT, zob. [`LICENSE`](LICENSE). Licencja nie obejmuje fontów opisanych wyżej,
które mają własne warunki.
