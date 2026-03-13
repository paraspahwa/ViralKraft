# AnimeForge Integration Status

This note maps the provided AnimeForge master spec to what should be implemented now versus later in this repository.

## Implemented (Required Now)

- Top 10 model catalog integrated in create flow.
- Duration selector integrated: 10s, 30s, 1 min, 2 min.
- Credit estimation and deduction in create flow now uses 10-second block pricing math.
- Subscription pricing strategy integrated:
  - Free Trial
  - Starter
  - Creator
  - Pro
  - Studio
- Pay-per-use credit packs integrated:
  - 100, 250, 500, 1000 credits
- Checkout flow supports both purchase types:
  - subscription
  - credits
- Free Trial CTA routes to registration/login page.

## Deferred (Not Required For This Codebase Right Now)

- Real wallet ledger and persistent credit-balance deduction at generation time.
  - Current behavior tracks and displays deduction in generation flow metadata/session.
  - A dedicated credits ledger table and transactional deduction API are needed for full enforcement.
- Automated model routing by tier (Budget/Standard/Quality/Premium) beyond manual model selection.
- Serverless vs self-hosted GPU switching/orchestration logic.
- Dynamic benchmark ingestion (VBench refresh pipeline).

## Why Deferred

- The current codebase has subscription/order flows but no persistent wallet schema or ledger transaction API.
- GPU provider orchestration and benchmark pipelines require additional infra beyond existing serverless endpoints.

## Recommended Next Step

1. Add a persistent credits wallet:
   - `credit_wallets` table
   - `credit_transactions` table
   - transactional endpoint to reserve/deduct/refund credits per generation
2. Wire generation endpoint to enforce available credits before processing.
3. Move UI-only credit deduction to backend-confirmed deduction state.
