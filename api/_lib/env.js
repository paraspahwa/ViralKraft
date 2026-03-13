const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

export function assertRequiredEnv() {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function getPublicConfig() {
  return {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    falConfigured: Boolean(process.env.FAL_API_KEY),
  };
}
