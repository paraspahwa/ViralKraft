import { handleOptions, sendJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const orderId = typeof req.query.orderId === "string" ? req.query.orderId : "";

    if (!orderId) {
      sendJson(res, 400, { error: "orderId is required" });
      return;
    }

    const supabase = getSupabaseAdmin();

    const { data: orderRow, error: orderError } = await supabase
      .from("payment_orders")
      .select("id, status, user_id, plan_id, billing_cycle, updated_at")
      .eq("razorpay_order_id", orderId)
      .single();

    if (orderError || !orderRow) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    let subscriptionStatus = null;
    if (orderRow.user_id) {
      const { data: subscriptionRow } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", orderRow.user_id)
        .single();

      subscriptionStatus = subscriptionRow?.status || null;
    }

    sendJson(res, 200, {
      ok: true,
      orderId,
      status: orderRow.status,
      subscriptionStatus,
      updatedAt: orderRow.updated_at,
      planId: orderRow.plan_id,
      billingCycle: orderRow.billing_cycle,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to check order status",
    });
  }
}
