import { getOrCreateWallet } from "./_lib/credits.js";
import { handleOptions, sendJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

function getBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
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
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      sendJson(res, 401, { error: "Authorization token is required" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      sendJson(res, 401, { error: "Invalid authorization token" });
      return;
    }

    const requestedLimit = Number(req.query?.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 30)
      : 10;

    const userId = userData.user.id;
    const wallet = await getOrCreateWallet(supabase, userId);

    const { data: transactions, error: txError } = await supabase
      .from("credit_transactions")
      .select("id,transaction_type,amount,balance_after,reference_type,reference_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (txError) {
      throw new Error(txError.message || "Could not load credit transactions");
    }

    sendJson(res, 200, {
      ok: true,
      balance: Number(wallet.balance || 0),
      transactions: (transactions || []).map((tx) => ({
        id: tx.id,
        transactionType: tx.transaction_type,
        amount: Number(tx.amount || 0),
        balanceAfter: Number(tx.balance_after || 0),
        referenceType: tx.reference_type || null,
        referenceId: tx.reference_id || null,
        createdAt: tx.created_at,
      })),
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load wallet transactions",
    });
  }
}