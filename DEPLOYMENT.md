# Deploying Tema Label to https://temalabel.com

## 1. Environment variables (set on the host — never commit them)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://temalabel.com` (**must be set at build time**) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API Keys → Publishable |
| `SUPABASE_SECRET_KEY` | Supabase → API Keys → Secret (server only) |
| `DATABASE_URL` | Supabase → Connect → **Transaction pooler** (port 6543) |
| `DIRECT_URL` | Supabase → Connect → **Session pooler** (port 5432), used only for migrations |
| `DATABASE_POOL_MAX` | optional, default `5` |
| `RESEND_API_KEY`, `EMAIL_FROM` | order confirmation / status emails (Resend; verify `temalabel.com` there first) |
| `ORDER_NOTIFY_EMAIL` | where **you** get new-order emails (defaults to the support email in Settings) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | optional instant new-order alert on your phone |
| `CRON_SECRET` | long random string protecting the daily reminder endpoint |
| `ORDER_TOKEN_SECRET` | optional; signs order/unsubscribe links (defaults to the Supabase secret key) |

## 2. Build & run

```bash
npm ci                 # runs `prisma generate` automatically
npm run db:migrate     # apply migrations to the production database (once per release)
npm run build
npm start              # listens on $PORT (default 3000)
```

Node **22+**. Put it behind HTTPS (Vercel, Cloudflare, Nginx/Caddy…). The app sends HSTS, a CSP and other security headers itself.

## 3. First-time data

```bash
cp admins.example.json admins.local.json    # real emails + strong passwords
npm run db:seed:admins                       # creates the admin accounts
```
```bash
npm run db:seed:content   # loads the default Privacy / Terms / Shipping / Returns text and the FAQ so you can edit them in Admin → Policy pages / FAQ (never overwrites your edits)
```
To start with an empty store: `npm run db:clear-demo` (dry run) then `npm run db:clear-demo -- --yes` archives the 16 demo products and deletes the 4 demo collections.

Do **not** run `npm run db:seed` on production unless you want the demo catalog; add real products from *Admin → Products*.

## 3b. Scheduled job (once a day)

Call `GET https://temalabel.com/api/cron/transfer-reminders` with the header `Authorization: Bearer <CRON_SECRET>`.
It emails/Telegrams you the InstaPay/wallet orders that are still waiting for your payment confirmation (stock stays reserved for them; nothing is auto-cancelled).
Use Vercel Cron, your host's cron, or a free service such as cron-job.org.

## 4. DNS / domain

- Point `temalabel.com` at the host. `www.temalabel.com` is redirected to the apex automatically (add the DNS record for `www` too).
- In Supabase → Authentication → URL Configuration set **Site URL** to `https://temalabel.com`.

## 5. After going live — checklist

1. **Rotate secrets that were shared in chat**: Supabase secret key, database password, and every admin password (Admin → Profile).
2. Admin → Settings: shop phone/email, shipping fees, InstaPay address / wallet number, announcement text.
3. Run a real order: you should receive the Telegram/email alert, and the customer the confirmation email with a link to `/order/<number>`.
3b. Replace the logo files (`public/logos/tema-black.png`, `tema-white.png`), `app/favicon.ico`, `public/images/og-image.png` (1200×630) with the real brand assets, and upload real product photos.
4. Fill `siteConfig.links` in `constants/site.ts` with your social profiles.
5. Make the brand findable ("tema", "tema store", "tema label") — see the section below.
6. Place a real test order (COD and a transfer), confirm it from Admin, then cancel it.
7. Point an uptime monitor at `https://temalabel.com/api/health`.

## 6. Known limits to be aware of

- Rate limiting is in-memory per instance — on serverless hosts it is best-effort. Put Cloudflare (or similar) in front for real bot protection.
- No transactional emails yet (order confirmation / shipping updates).
- Transfer payments are verified manually by an admin.

## Getting found for "tema", "tema store", "tema label"

Nobody can guarantee a #1 position (especially for the single word "tema", which is very common), but the site is set up so search engines understand the brand: the name and its aliases ("Tema", "Tema Store", "Tema Label Store") are in the structured data, titles, headings and footer. What moves the ranking is what happens outside the code:

1. **Google Search Console** → add `https://temalabel.com` (Domain property) → verify (DNS TXT, or paste the HTML-tag code in *Admin → Settings → Search engines*) → submit `https://temalabel.com/sitemap.xml` → "Request indexing" for the home page. Do the same in **Bing Webmaster Tools** (can import from Search Console).
2. **Google Business Profile** and an **Instagram / Facebook / TikTok** page named "Tema Label" with a link to the site. Put the same links in `siteConfig.links` (`constants/site.ts`) — they are exposed to Google as `sameAs`.
3. Get the brand mentioned and linked by other sites (press, influencers, directories). A brand search ranks first mostly because many sites say "Tema Label → temalabel.com".
4. Keep the name consistent everywhere ("Tema Label"), use real photos with descriptive names, and keep adding products/collections.
5. Indexing a new domain takes days to weeks; brand-name results usually appear first, generic words later.

## Realtime admin updates

The dashboard listens on a private Supabase Realtime channel (`admin-events`). New orders, payment proofs,
messages and subscribers appear as toasts and refresh the open page; the header shows Live/Offline and a sound toggle.
Requires migration `20261024020000_admin_realtime` (only active admins can listen; browsers cannot publish).
Verify with `npm run qa:realtime`. If Realtime is unreachable the dashboard still works, it just doesn't live-update.
