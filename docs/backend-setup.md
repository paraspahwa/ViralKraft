# ViralKraft Backend Setup

## Architecture
- Frontend: Vite + React hosted on Vercel.
- Backend: Vercel serverless functions in `/api`.
- Database: Supabase Postgres.
- Payments: Razorpay order + webhook flow.
- Credit pricing: API serves subscription tiers and pay-per-use credit packs with `1 credit = $0.0999`; checkout is charged in localized currency.

## API Endpoints
- `GET /api/health` - service health and public payment key check.
- `GET /api/geo-ip` - resolves caller geo from forwarded IP.
- `GET /api/pricing` - returns subscription tiers plus credit-pack catalog.
- `POST /api/generate-script` - generates 60s short-form script using GPT-4o mini.
- `POST /api/create-order` - creates Razorpay order and stores pending order in Supabase.
- `POST /api/razorpay-webhook` - verifies signature and updates order/subscription state.

## Supabase Setup
1. Create a Supabase project.
2. Open SQL editor and run `supabase/schema.sql`.
3. Copy project URL and keys into Vercel environment variables.

## Razorpay Setup
1. Create account and generate API key pair from dashboard.
2. Create webhook endpoint: `https://<your-domain>/api/razorpay-webhook`.
3. Subscribe to at least these events:
   - `payment.captured`
   - `payment.failed`
4. Set webhook secret in Vercel as `RAZORPAY_WEBHOOK_SECRET`.

## Pre-Deploy Checklist
- Frontend env (required for auth and login flow):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
- Backend env (required for API routes):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (default: `gpt-4o-mini`)
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
- Supabase Auth:
   - Enable providers you use (Email OTP and/or Google OAuth).
   - Add redirect URLs for local and production domains.
- Razorpay Webhook:
   - Webhook URL points to `/api/razorpay-webhook` on deployed domain.
   - Webhook secret exactly matches `RAZORPAY_WEBHOOK_SECRET` in Vercel.
- Domain-specific notes:
   - Local dev: use test Razorpay keys (`rzp_test_*`).
   - Production: switch to live Razorpay keys (`rzp_live_*`).
   - Do not expose server-only secrets in `VITE_*` variables.

## Vercel Deployment
1. Import repo into Vercel.
2. Set Environment Variables from `.env.example`.
3. Ensure Supabase auth providers and redirect URLs are configured for your deployed domain.
4. Deploy.
5. Test endpoints:
   - `/api/health`
   - `/api/pricing`
   - `/api/order-status?orderId=<razorpay_order_id>`
6. Validate payment lifecycle:
   - Create order from pricing UI.
   - Complete checkout in Razorpay.
   - Confirm webhook delivery to `/api/razorpay-webhook`.
   - Confirm `payment_orders.status` becomes `captured` and `subscriptions.status` becomes `active`.

## Smoke Test Commands
Use these commands after deployment to verify API health and pricing quickly.

```bash
# Replace with your deployed domain
BASE_URL="https://your-app.vercel.app"

# Health
curl -sS "$BASE_URL/api/health"

# Expected: {"ok":true,...}
# Check: service="viralkraft-backend" and HTTP 200

# Credit-based pricing catalog
curl -sS "$BASE_URL/api/pricing"

# Expected: {"ok":true,"pricing":{"unit":"credits","usdPerCredit":0.0999,"subscriptionTiers":[...],"creditPacks":[...]}}
# Check: 5 subscription tiers (free_trial, starter, creator, pro, studio) and 4 credit packs

# Pricing (country override accepted for checkout context)
curl -sS "$BASE_URL/api/pricing?country=IN"

# Expected: same credit catalog payload

# Order status (replace with real Razorpay order id)
curl -sS "$BASE_URL/api/order-status?orderId=order_xxxxx"

# Expected for user-scoped order without token: HTTP 401
# Expected for unknown order id: HTTP 404
```

For user-scoped orders, include the bearer token when checking order status:

```bash
curl -sS \
   -H "Authorization: Bearer <supabase_access_token>" \
   "$BASE_URL/api/order-status?orderId=order_xxxxx"

# Expected: {"ok":true,"status":"created|captured|failed",...}
# Success path: status="captured" and subscriptionStatus="active"
```

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---|---|---|
| `/api/health` fails or shows missing config | One or more env vars are missing in Vercel | Recheck all values in Pre-Deploy Checklist and redeploy |
| Login page shows auth not configured | Frontend env vars not set | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Google login redirects back with error | Google provider disabled or redirect URL mismatch | Enable Google provider in Supabase and add exact redirect URLs for local/prod |
| `/api/create-order` returns auth required | Paid checkout attempted without logged-in user | Sign in first, then retry checkout |
| `/api/order-status` returns 401 | User-scoped order checked without bearer token | Send `Authorization: Bearer <supabase_access_token>` |
| `/api/order-status` returns 403 | Token belongs to different user than order owner | Use the same user account that created the order |
| `/api/order-status` keeps `created` | Webhook not firing or signature mismatch | Verify webhook URL, subscribed events, and `RAZORPAY_WEBHOOK_SECRET` |
| Payment succeeded in Razorpay but subscription not active | Webhook delivery failed or database write error | Check Vercel logs for `/api/razorpay-webhook` and validate Supabase service key |
| Pricing catalog looks wrong | Deployment mismatch or stale cache | Verify `/api/pricing` returns tiers and packs with `usdPerCredit:0.0999` |

## Launch-Day Go-Live Checklist
- Final environment verification:
   - Production Vercel project has all frontend and backend env vars set.
   - `RAZORPAY_KEY_ID` is live (`rzp_live_*`) in production.
   - `RAZORPAY_WEBHOOK_SECRET` matches dashboard webhook configuration.
- Auth verification:
   - Email OTP login works on production domain.
   - Google OAuth login works and redirects back to app.
   - Protected routes (`/dashboard`, `/create`) redirect unauthenticated users to `/login`.
- Payments verification:
   - Checkout opens for paid plans only after login.
   - `create-order` succeeds for logged-in paid flow and fails for logged-out paid flow.
   - Razorpay webhook receives `payment.captured` in production.
   - Supabase reflects `payment_orders.status=captured` and `subscriptions.status=active`.
- Navigation and UX checks:
   - Navbar links from `/login` correctly navigate to landing sections.
   - Pricing page resumes status polling after refresh for in-flight orders.
   - Success/failure states display expected modal/toast messages.
- Rollback readiness:
   - Previous stable deployment is known in Vercel for instant rollback.
   - Team has access to Vercel + Supabase + Razorpay dashboards.

## Pricing Strategy
- Conversion rate: `1 credit = $0.0999`.
- Subscription tiers:
   - Free Trial: 3 videos, 480p, Free
   - Starter: 20/month, 480p, $4.99
   - Creator: 50/month, 720p, $14.99
   - Pro: 100/month, 720p HQ, $29.99
   - Studio: Unlimited, 1080p, $99.99
- Pay-per-use packs: 100/$9.99, 250/$19.99, 500/$34.99, 1000/$59.99
- Checkout remains region-localized (INR/USD) via Razorpay.
- Revenue optimization:
  - Push yearly plan discount by default in checkout UI.
  - Use geo-aware anchor pricing to reduce friction.
  - Require login before paid checkout to keep orders user-scoped.
  - Resume payment verification with persisted order ID after refresh.
  - Use webhook-driven access provisioning for immediate value realization.
