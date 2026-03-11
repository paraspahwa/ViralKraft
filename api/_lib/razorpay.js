import crypto from "node:crypto";
import Razorpay from "razorpay";

let razorpayClient;

export function getRazorpayClient() {
  if (razorpayClient) {
    return razorpayClient;
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured");
  }

  razorpayClient = new Razorpay({ key_id, key_secret });
  return razorpayClient;
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function makeReceipt() {
  return `rcpt_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}
