import { handleOptions, sendJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

function getBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const lower = authHeader.toLowerCase();
  if (!lower.startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
}

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

    if (orderRow.user_id) {
      const token = getBearerToken(req.headers.authorization);
      if (!token) {
        sendJson(res, 401, { error: "Authorization token is required for this order" });
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData?.user) {
        sendJson(res, 401, { error: "Invalid authorization token" });
        return;
      }

      if (userData.user.id !== orderRow.user_id) {
        sendJson(res, 403, { error: "Not authorized to access this order" });
        return;
      }
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
