# Full test report — Tema Label store

Run on **2026-10-24** against the production build and the real Supabase database. All temporary data created by
the tests (orders, customers, products, coupons, QA admin accounts, uploaded screenshots) was removed afterwards.

## Result: everything passes

| Area | How it was tested | Result |
|---|---|---|
| Types / lint | `tsc --noEmit`, ESLint | clean |
| Unit tests | Vitest (pricing, filters, cart, permissions, tokens, phone, placeholders…) | **42 passed** |
| Checkout integration (real DB) | `npm run test:integration` — 10 parallel buyers, coupon races, price tampering, bad input, archived products, returning customers | **10 passed** |
| Database integrity | `npm run qa:db` — RLS on all 17 tables, no negative stock, totals add up, no orphans, every live product has an image + variant | **21/22**, 1 warning (see below) |
| Public-API lockdown | anonymous Supabase key cannot read/write any table, cannot list/upload/delete in storage | pass |
| Roles & permissions | `npm run qa:roles` — SUPER_ADMIN / ADMIN / EDITOR / SUPPORT × 23 admin routes, deactivated admin, user without admin row, anonymous, tampered token | **10/10** (real HTTP 307 redirects) |
| Accessibility | `npm run qa:a11y` — axe-core on the HTML of 23 pages; plus axe in the browser in light + dark | **0 violations** |
| Lighthouse (mobile, throttled) | home / shop / product / checkout | Accessibility **100**, Best practices **100**, SEO **100** (indexable pages), Performance 79–87 (see notes) |
| Links & images | crawl of every page reachable from the home page | 36 pages, 110 images, **0 broken** |
| SEO tags | title, description, canonical, Open Graph, structured data on all 38 URLs | pass |
| Security | headers + CSP, www→apex redirect, unauthenticated CSV export (307), cron endpoint (401 without secret), `/api/health` | pass |
| Mobile | no horizontal overflow on 11 key pages at 375 px (earlier run) | pass |
| End-to-end in a browser | add to bag → mini bag → checkout (InstaPay) → permanent order page (survives refresh) → screenshot upload → admin sees sender/reference/screenshot → confirm payment → status change → cancel → stock restored | pass |
| Product lifecycle (earlier run) | create draft → duplicate → bulk publish (skips products without image) → archive → typed-DELETE permanent delete → no orphans | pass |

## Bugs found by this round of testing — all fixed

1. **Admin section pages answered `200` and redirected late.** A role without permission (e.g. an Editor opening Orders) received an HTML shell with a client-side redirect. No data leaked, but it is now a real `307` before anything is sent (`lib/auth/route-permissions.ts` + `proxy.ts`).
2. **Confirming a payment and then saving the order form could revert it** (the form kept stale values and overwrote `PAID` with `AWAITING_VERIFICATION`). The form now refreshes when the server changes the order. Verified end-to-end.
3. **Burst of simultaneous checkouts could fail with a generic error** (database connection queue timed out after 2 s). Checkout transactions now wait up to 15 s; 10 parallel buyers for 3 units gives exactly 3 orders, 7 clean "out of stock" messages.
4. **310 KB `favicon.ico`** shipped on every first visit → 4 KB.
5. **Mobile performance**: the animation library and mini-bag / menu / search were in the first-load bundle. They now load on first use; hero animation is CSS. Home Total Blocking Time 1.9 s → 0.13 s; first product row and hero image load with high priority.
6. **Accessibility**: low-contrast grey text (`neutral-400`) raised; missing landmark for the announcement bar; heading order (footer, product cards, info panels); unlabeled sort `<select>`; header icon buttons below the 24 px touch-target minimum; logo `width/height` mismatch (logo is now fitted into a box and never stretched).
7. Order numbers now start at **#1001** instead of a test-polluted sequence.

## Needs you (cannot be tested from here)

- **Supabase → Authentication → Sign In / Providers → turn off "Allow new users to sign up".** There are no customer accounts, so open sign-up is pointless (an extra sign-up cannot reach the admin, which is why this is only a warning).
- **Real email / Telegram delivery.** The notification code is covered by the no-credentials path only; add the keys from `.env.example` and place a real order to see them arrive.
- **Real phones, Safari/Firefox, and the live `temalabel.com` deployment** (tested in Chrome/headless Chrome on localhost).
- **Google indexing / ranking** (depends on Search Console and time).
- **Real product photos and logos** — Lighthouse LCP (≈4–5 s on the throttled "slow 4G" profile) is dominated by image delivery; real compressed WebP/AVIF photos on Vercel's CDN will do better than the local server.
- **Load beyond ~10 simultaneous checkouts** and very large catalogs (>150 products: the catalog is embedded in each page).
- Arabic / RTL (not built).

## How to re-run

```bash
npm run qa:all                                   # types, lint, unit + integration tests, DB checks
npm run build && npm start &                     # then, in another terminal:
QA_BASE=http://localhost:3000 npm run qa:roles   # permission matrix
QA_BASE=http://localhost:3000 npm run qa:a11y    # accessibility of every page
```
`test:integration` and `qa:db` / `qa:roles` use the real database from `.env.local` (they clean up after themselves); run them against a staging project if you prefer.
