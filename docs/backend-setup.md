# ViralKraft Backend Setup

## Architecture
- Frontend: Vite + React hosted on Vercel.
- Backend: Vercel serverless functions in `/api`.
- Database: Supabase Postgres.
- Payments: Razorpay order + webhook flow.
- Geo pricing: IP-based region detection with INR for India, USD for rest-of-world.

## API Endpoints
- `GET /api/health` - service health and public payment key check.
- `GET /api/geo-ip` - resolves caller geo from forwarded IP.
- `GET /api/pricing` - returns plan catalog based on geo or `?country=IN`.
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

## Vercel Deployment
1. Import repo into Vercel.
2. Set Environment Variables from `.env.example`.
3. Deploy.
4. Test endpoints:
   - `/api/health`
   - `/api/pricing`

## Pricing Strategy
- India: INR localized pricing via Razorpay partner stack.
- Global: USD pricing.
- Plans: Starter, Growth, Scale with monthly and yearly options.
- Revenue optimization:
  - Push yearly plan discount by default in checkout UI.
  - Use geo-aware anchor pricing to reduce friction.
  - Add webhook-driven access provisioning for immediate value realization.
