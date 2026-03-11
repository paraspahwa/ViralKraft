import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hasAll(text, snippets) {
  return snippets.every((snippet) => text.includes(snippet));
}

function main() {
  const envExample = read(".env.example");
  const docs = read("docs/backend-setup.md");
  const routes = read("src/app/routes.tsx");
  const loginPage = read("src/app/pages/LoginPage.tsx");
  const createVideoPage = read("src/app/pages/CreateVideoPage.tsx");
  const pricingSection = read("src/app/components/landing/PricingSection.tsx");
  const createOrderApi = read("api/create-order.js");
  const generateScriptApi = read("api/generate-script.js");
  const orderStatusApi = read("api/order-status.js");
  const webhookApi = read("api/razorpay-webhook.js");

  const requiredEnv = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ];

  assert(hasAll(envExample, requiredEnv), "Missing required env keys in .env.example");
  assert(routes.includes('path: "login"'), "Login route is missing in router");
  assert(loginPage.includes("signInWithOtp"), "Email OTP login flow is missing");
  assert(loginPage.includes("signInWithOAuth"), "Google OAuth login flow is missing");
  assert(createVideoPage.includes('/api/generate-script'), "Create video page is not wired to generate-script API");

  assert(
    generateScriptApi.includes("gpt-4o-mini") &&
      generateScriptApi.includes("OPENAI_API_KEY"),
    "Generate script API is missing OpenAI GPT-4o mini integration",
  );

  assert(
    pricingSection.includes("CHECKOUT_ORDER_STORAGE_KEY") &&
      pricingSection.includes("persistPendingOrder") &&
      pricingSection.includes("readPendingOrderId"),
    "Checkout resume polling storage flow is missing",
  );

  assert(
    pricingSection.includes("Authorization: `Bearer ${user.accessToken}`"),
    "User-scoped order-status polling authorization header is missing",
  );

  assert(
    createOrderApi.includes("Authentication required to create a paid order"),
    "Paid order auth safeguard is missing in create-order API",
  );

  assert(
    orderStatusApi.includes("Authorization token is required for this order") &&
      orderStatusApi.includes("Not authorized to access this order"),
    "User-scoped access checks are missing in order-status API",
  );

  assert(
    webhookApi.includes("verifyWebhookSignature") &&
      webhookApi.includes("payment.captured") &&
      webhookApi.includes("payment.failed"),
    "Webhook signature or event handlers are missing",
  );

  assert(
    docs.includes("## Pre-Deploy Checklist") &&
      docs.includes("## Smoke Test Commands") &&
      docs.includes("## Troubleshooting"),
    "Deployment readiness docs sections are missing",
  );

  assert(
    docs.includes("POST /api/generate-script") && docs.includes("OPENAI_API_KEY"),
    "Docs are missing AI script generation endpoint/env guidance",
  );

  console.log("Auth/payment deployment checks passed.");
}

main();
