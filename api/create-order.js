import { assertRequiredEnv } from "./_lib/env.js";
import { getRequestIp, lookupGeo } from "./_lib/geo.js";
import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";
import { resolvePlanAmount } from "./_lib/pricing.js";
import { getRazorpayClient, makeReceipt } from "./_lib/razorpay.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    assertRequiredEnv();

    const body = await readJsonBody(req);
    const planId = body.planId;
    const billingCycle = body.billingCycle || "monthly";
    const userId = body.userId || null;
    const email = body.email || null;
    const requestCountry = body.countryCode || "";

    if (!planId) {
      sendJson(res, 400, { error: "planId is required" });
      return;
    }

    const detectedCountry = requestCountry || (await lookupGeo(getRequestIp(req))).countryCode;
    const selection = resolvePlanAmount({
      planId,
      billingCycle,
      countryCode: detectedCountry,
    });

    // Paid orders must always be tied to a user to keep order status checks user-scoped.
    if (selection.amountMajor > 0 && !userId) {
      sendJson(res, 401, { error: "Authentication required to create a paid order" });
      return;
    }

    const razorpay = getRazorpayClient();
    const receipt = makeReceipt();
    const notes = {
      planId: selection.planId,
      billingCycle: selection.billingCycle,
      countryCode: detectedCountry,
      userId: userId || "",
      email: email || "",
    };

    const order = await razorpay.orders.create({
      amount: selection.amountMinor,
      currency: selection.currency,
      receipt,
      notes,
    });

    const supabase = getSupabaseAdmin();
    await supabase.from("payment_orders").insert({
      user_id: userId,
      plan_id: selection.planId,
      billing_cycle: selection.billingCycle,
      currency: selection.currency,
      amount_minor: selection.amountMinor,
      status: "created",
      razorpay_order_id: order.id,
      receipt,
      metadata: notes,
    });

    sendJson(res, 200, {
      ok: true,
      orderId: order.id,
      amount: selection.amountMinor,
      currency: selection.currency,
      planId: selection.planId,
      billingCycle: selection.billingCycle,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to create order",
    });
  }
}
