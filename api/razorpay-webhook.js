import { assertRequiredEnv } from "./_lib/env.js";
import { handleOptions, readRawBody, sendJson } from "./_lib/http.js";
import { verifyWebhookSignature } from "./_lib/razorpay.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

function getPeriodEnd(billingCycle) {
  const now = new Date();
  const end = new Date(now);
  if (billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end.toISOString();
}

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

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = await readRawBody(req);

    if (!verifyWebhookSignature(rawBody, typeof signature === "string" ? signature : "")) {
      sendJson(res, 401, { error: "Invalid webhook signature" });
      return;
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity) {
      sendJson(res, 200, { ok: true, skipped: true, reason: "No payment entity" });
      return;
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    const supabase = getSupabaseAdmin();
    const { data: orderRow, error: orderError } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();

    if (orderError || !orderRow) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    if (event === "payment.captured") {
      await supabase
        .from("payment_orders")
        .update({
          status: "captured",
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRow.id);

      await supabase.from("subscriptions").upsert(
        {
          user_id: orderRow.user_id,
          plan_id: orderRow.plan_id,
          billing_cycle: orderRow.billing_cycle,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: getPeriodEnd(orderRow.billing_cycle),
          metadata: {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          },
        },
        { onConflict: "user_id" },
      );
    }

    if (event === "payment.failed") {
      await supabase
        .from("payment_orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRow.id);
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Webhook processing failed",
    });
  }
}
