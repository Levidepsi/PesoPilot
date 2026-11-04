# PesoPilot — Small Business Finance Manager

A Next.js / Prisma / PostgreSQL starter application for Philippine small businesses. Inspired by the supplied dashboard screenshot.

## Included

- Email/password registration and signed HTTP-only cookie sessions
- Multiple businesses per user and OWNER / ADMIN / STAFF / VIEWER roles
- Business-specific finance dashboard and six-month charts
- Income/expense transactions, customers, Debt, partial debt payments
- Inventory, low-stock indicators, stock adjustments
- Single-product sales with automatic inventory deduction and cash transaction
- CSV reports, business settings, team invitations by existing email
- Subscription data model and FREE plan, **not live billing**

## Requirements

- Node.js 20.9+ (22 LTS recommended)
- PostgreSQL 15+ (local, Supabase, Neon, etc.)
- npm

## Start locally

1. Unzip and open the folder in VS Code.
2. Create a PostgreSQL database named `pesopilot` (or use a hosted PostgreSQL database).
3. Copy `.env.example` to `.env` and set `DATABASE_URL` and a random `SESSION_SECRET` of at least 32 characters. Example secret generation: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
4. Run:

```bash
npm install
npm run setup
npm run dev
```

5. Visit http://localhost:3000/login and register your business.

## Deployment

Set DATABASE_URL and SESSION_SECRET in Vercel, run `npx prisma db push` against your deployment database before first launch, then deploy. Use a connection pooler when needed. Enable managed backups, HTTPS and monitoring.

## Notes and limitations

This is a **development MVP**, not an audited production financial platform. The included sessions are self-contained signed cookies; add MFA, login throttling, CSRF threat review, error handling, full audit coverage, and security testing before exposing publicly. Payment integrations, paid billing, BIR-certified invoicing, bank syncing, receipt upload, recurring reminders and true double-entry accounting require external accounts and additional development. Sales currently support one product per checkout. Stock edits use basic checks; strengthen concurrent inventory adjustment logic before production. The Debt module uses transaction-bound writes, but concurrent debt payment race prevention and idempotency are not yet implemented. This is a cash-flow tracker, not an official profit-and-loss or BIR tax system.

The app uses integer **centavos** (Prisma Int) and therefore has a maximum per-record value; use BigInt for very large balances.

## Useful commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript validation
- `npm run db:push` — sync schema (development only)
- `npm run db:seed` — informational seed (no shared demo data)

## Email verification and password recovery

Authentication stays in this app. Resend delivers the email; it does not manage accounts.

1. Create a Resend sending API key and verify your sending domain (https://resend.com/docs/dashboard/domains/introduction).
2. Add `RESEND_API_KEY`, `EMAIL_FROM` (for example `PesoPilot <noreply@your-domain.com>`), and `APP_URL` to your local `.env`. Use `http://localhost:3000` locally and your exact HTTPS origin in production. Never expose the API key through a NEXT_PUBLIC variable.
3. Run `npm run db:push` and `npx prisma generate`, then restart the app. The schema adds nullable verification/cooldown timestamps, a session version, and an AuthToken table; existing business records are preserved.
4. Register and follow the verification link, then press Verify email. Existing users must request a verification link at `/verify-email` before logging in. Existing sessions will require a fresh login.
5. Use Forgot password on the login screen to request a reset. Enter and confirm the new password, then log in again. Resetting a password invalidates all previous sessions.

Verification links expire in 24 hours; reset links expire in 30 minutes. Only hashes are stored and successful consumption is transactional. Each account/purpose has a 60-second email cooldown. Recovery and resend screens use generic responses for unknown accounts and delivery errors; check server logs for delivery failures. A resend replaces the older link. Email links require a form submission so mail scanners do not consume them on GET.

Missing email configuration prevents registration; existing accounts remain stored. Configure delivery before enabling these changes for users. Test inbox delivery, expired/reused links, password confirmation, and session invalidation in staging. Provider delivery has not been verified until a real configured mailbox receives a message. Add broader IP/global abuse controls before a public launch.

Authentication tests: `node --import tsx --test tests/auth.test.ts` runs the token/password checks. To include database integration tests in PowerShell, run `$env:AUTH_DB_TEST="1"; node --env-file=.env --import tsx --test tests/auth.test.ts`. The database test creates a temporary user at example.invalid, exercises expiry, wrong-purpose rejection, concurrent single use and session-version updates, and deletes that user afterward. It sends no email.

Temporary local bypass: set `EMAIL_AUTH_ENABLED="false"` in `.env` and restart the server to allow login and registration without email verification. Email sending is disabled in this mode; verification records are preserved. Set it back to `true` after configuring Resend.

## Plans (payments not connected)

Settings includes monthly/yearly pricing: Free, Starter (PHP 149/month or PHP 1,428/year), and Business (PHP 399/month or PHP 3,828/year). Paid plan buttons open a prefilled WhatsApp inquiry to the public contact configured in `lib/manual-subscriptions.ts`. Monthly/yearly amounts follow the selected interval. No automatic payment collection or activation occurs. Verify the payment in your merchant account before manually updating the correct Subscription row: plan STARTER/BUSINESS, status ACTIVE, provider MANUAL, providerReference for the verified payment, and currentPeriodEnd for its expiry. Renewals are manual. The refund policy is displayed beside plans on the homepage, pricing, and Settings: full refunds requested within 7 days of first activation (monthly or yearly), renewals reviewed individually, and refunds for verified duplicate payments or subscriptions we cannot provide. Customers request refunds through WhatsApp with their account email and payment reference. Refunds are processed manually; applicable consumer rights remain unaffected.

Free allows one owned business, 100 transactions per Philippine calendar month, and 20 customers per business. Income entries, expense entries, product sales, and Debt repayments each create one counted transaction; unpaid debt records do not. Quotas use the record creation timestamp, not a user-selected transaction date. All saved transaction history remains accessible. Reaching a limit blocks new entries, not reading existing records.

Starter enables inventory/sales entry, cash-flow reports, CSV exports, and unlimited transaction/customer entries for one owned business. Business includes up to three owned businesses and five distinct staff users across them, excluding the owner. Low-stock indicators are included in Starter. PDF reports, advanced analytics, and priority support are not advertised as available.

The effective plan is the highest ACTIVE, unexpired subscription attached to a business owned by the same user; that entitlement is shared across that owner's businesses. A membership in somebody else's paid business does not upgrade your own businesses. Existing extra businesses, customers, staff memberships, and saved inventory/sales records are preserved; limits prevent additional creation. Future billing integration must keep this owner-level entitlement model consistent. There is no public action to self-activate a paid plan.

Plan quota writes acquire a database row lock on the owner within the same transaction as the count and write. Tests: `node --import tsx --test tests/plans.test.ts`. For database integration tests in PowerShell: `$env:PLAN_DB_TEST="1"; node --env-file=.env --import tsx --test tests/plans.test.ts`. Database tests use temporary records and clean them up afterward.

Metadata: set `APP_URL` to your public HTTPS origin when deploying (Vercel production domain is used as a fallback). Pricing is indexable and included in `/sitemap.xml`. Account and workspace pages default to noindex. The branded favicon, Apple touch icon, and social preview are bundled locally.

Public pages: `/` introduces PesoPilot with features, benefits, pricing and signup links. `/pricing` shows the plan comparison. Login and registration lead to `/dashboard`. Workspace pages share an authenticated route-group layout; the homepage and pricing stay public even while signed in. Online payment checkout remains disabled; paid subscriptions can be arranged manually through WhatsApp.

## Subscription administration

`/admin` is restricted on the server to the existing account identified by `SITE_ADMIN_USER_ID`. Business OWNER/ADMIN roles do not grant site-admin access. An empty setting denies access to everyone. Set this server-only variable locally and in Vercel; never use a NEXT_PUBLIC variable. Restart or redeploy after changing it.

Before deploying this feature to another database, run `npm run db:push` to create SubscriptionChange. Existing subscriptions are preserved. Search by owner email or business name, select Manage, and choose Activate, Renew, Change, or Cancel. Activation/renewal require confirmation of a verified merchant payment, a unique channel-prefixed reference, amount in PHP, and an explicit future expiry date (end of day in Philippine time). Change supports corrections without a new payment; a reason is always required. Renew extends the expiry; cancellation takes effect immediately and does not send money or issue refunds.

Each save atomically records the previous/new subscription, acting admin, timestamp, reason, and any verified payment. Payment references cannot be reused. Stale forms are rejected. The history displays the latest 50 records; earlier records remain stored. Records are retained independently of business deletion. Admin entries are separate from the customer's cash-flow transactions. Owner-wide plan inheritance still applies: another active owned-business subscription may preserve paid access after cancelling one subscription.

Validation: `npx tsx --test tests/admin-subscriptions.test.ts`.
