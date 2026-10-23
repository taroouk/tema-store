# Launch checklist — temalabel.com

The code is finished and verified (typecheck, lint, 38 unit tests, production build, 36 pages / 110 images with
no broken links, security headers, mobile widths, real order flows). What remains is **your content, accounts and
settings** — things only you can supply. Work top to bottom.

## ✅ Done in code

- Fake "The Film" video block removed; false claims removed (100 % combed cotton, Made in Egypt, OEKO-TEX, 240 GSM, "100 % secure"…).
  Fabric & care now come **per product** (Admin → Products) and the sections are hidden when empty.
- Permanent, signed **order page** `/order/<number>?t=…` (survives refresh, linked from the emails, shows payment instructions + screenshot upload).
- **Notifications**: new-order email + Telegram alert to you, confirmation email to the customer, emails on payment confirmed / shipped / delivered / cancelled, welcome email + one-click **unsubscribe** page. (They activate once you add the keys below.)
- Daily **reminder** of InstaPay/wallet orders still waiting for you (`/api/cron/transfer-reminders`).
- Checkout: governorate list, Egyptian phone validation (stored normalised), browser autofill hints, country fixed to Egypt.
- Social links, business details (commercial register, tax card, address), store hours and Google/Bing verification are editable in **Admin → Settings**.
- Per-product SEO title/description; richer Product structured data (sku, price validity, condition, seller, all images); correct absolute image URLs.
- Skip-to-content link; single `<main>` landmark.
- `npm run db:clear-demo` to archive the demo catalog; `npm run db:seed:content` for the policy pages + FAQ.
- Policies / FAQ editable from the dashboard; texts corrected to match what the site really does.

## 🔴 You must do before going live

| # | Item | How |
|---|------|-----|
| 1 | **Push the code to GitHub** | It is committed locally. `git push origin HEAD` (the repo is `taroouk/tema-store`). |
| 2 | **Rotate secrets that were shared in chat** | Supabase → API Keys (new secret key), Database → reset password, then update the host's env vars. Change both admin passwords in Admin → Profile. |
| 3 | **Set the environment variables** on the host | See `.env.example` / `DEPLOYMENT.md`. `NEXT_PUBLIC_SITE_URL=https://temalabel.com` must be set **before the build**. |
| 4 | **Migrate the database** | `npm run db:migrate` against production (already applied to the current Supabase project). |
| 5 | **Turn on emails + alerts** | Resend account → verify `temalabel.com` → `RESEND_API_KEY`, `EMAIL_FROM`; optional Telegram bot → `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`; `ORDER_NOTIFY_EMAIL`. Until then the site works but sends nothing. |
| 6 | **Schedule the daily reminder** | Daily `GET /api/cron/transfer-reminders` with `Authorization: Bearer <CRON_SECRET>` (Vercel Cron / host cron / cron-job.org). Set `CRON_SECRET`. |
| 7 | **Replace the demo catalog** | `npm run db:clear-demo` (dry-run), then `-- --yes`; add your real products + photos in Admin → Products. |
| 8 | **Brand assets** | `public/logos/tema-black.png` + `tema-white.png`, `app/favicon.ico`, `public/images/og-image.png` (1200×630). Optional: `app/apple-icon.png` (180×180) and 192/512 px icons for the manifest. |
| 9 | **Home-page photos** | Hero / category / editorial images in `public/images/`: confirm you own or licence them. |
| 10 | **Fill Admin → Settings** | Support email & phone, store hours, business address, commercial-register & tax-card numbers, social links, shipping fees, InstaPay address / wallet number. |
| 11 | **Review the policy texts** | Admin → Policy pages / FAQ: 14-day returns, 2-hour order changes, 5–7-day refunds, 2–4-day delivery are placeholders for *your* real policy. Also the home "Easy Exchange / Delivery" blurbs. |
| 12 | **Supabase** | Authentication → URL Configuration → Site URL `https://temalabel.com`. Check your plan has daily backups (free tier has no point-in-time restore). |
| 13 | **Live test on the real domain, from a phone** | COD order and an InstaPay order with a screenshot → check you get the alert, the customer gets the email, confirm it in Admin, then cancel it (stock returns). |
| 14 | **Search engines** | Search Console + Bing Webmaster (paste the codes in Settings), submit `sitemap.xml`; see the "Getting found" section in `DEPLOYMENT.md`. |

## 🟠 Recommended soon (not blockers)

- **Arabic version / RTL** — the site is English only; most Egyptian shoppers search in Arabic. Biggest remaining growth item.
- **Analytics + ad pixels** (GA4 / Meta / TikTok) — none installed; needs a cookie-consent banner and a Privacy-page update when added.
- **Error monitoring** (Sentry) and an uptime check on `/api/health`.
- **Cloudflare in front of the site** (bot protection, real rate limiting — the built-in limiter is per-server).
- **Admin 2FA** (Supabase MFA) for the super-admin accounts.
- **Courier integration** (Bosta / Aramex) and printable shipping labels.
- Newsletter **campaign sending** (subscribers can be exported as CSV today; welcome email and unsubscribe exist).

## 🟡 Later

Customer accounts, product reviews, abandoned-cart recovery, back-in-stock alerts, bulk product import, card/wallet
gateway (Paymob / Fawry) for automatic payment confirmation, Playwright end-to-end tests, formal accessibility audit.

## ⚙️ Performance notes

- ~255 KB gzipped JS per page (target < 170 KB): framer-motion, Supabase client and icons are the main weight.
- The whole catalog is embedded in every page (for bag / search / wishlist). Fine up to ~150 products; beyond that move lookups to an API.
- Real, compressed product photography (WebP/AVIF) will matter more than any code change.
