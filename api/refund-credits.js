import { getOrCreateWallet, roundCredits } from "./_lib/credits.js";
import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";
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

  if (req.method !== "POST") {
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

    const body = await readJsonBody(req);
    const referenceId = typeof body.referenceId === "string" ? body.referenceId.trim() : "";
    if (!referenceId) {
      sendJson(res, 400, { error: "referenceId is required" });
      return;
    }

    const userId = userData.user.id;

    const { data: existingRefundTx } = await supabase
      .from("credit_transactions")
      .select("id,amount,balance_after")
      .eq("user_id", userId)
      .eq("transaction_type", "refund")
      .eq("reference_type", "generation")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (existingRefundTx) {
      sendJson(res, 200, {
        ok: true,
        reused: true,
        refundedCredits: Math.abs(Number(existingRefundTx.amount || 0)),
        balance: Number(existingRefundTx.balance_after || 0),
      });
      return;
    }

    const { data: debitTx } = await supabase
      .from("credit_transactions")
      .select("id,amount,metadata")
      .eq("user_id", userId)
      .eq("transaction_type", "video_generation_debit")
      .eq("reference_type", "generation")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (!debitTx) {
      sendJson(res, 404, {
        error: "No matching generation debit found for this reference",
      });
      return;
    }

    const refundedCredits = Math.abs(Number(debitTx.amount || 0));
    if (refundedCredits <= 0) {
      sendJson(res, 400, { error: "Invalid debit transaction amount" });
      return;
    }

    const wallet = await getOrCreateWallet(supabase, userId);
    const currentBalance = Number(wallet.balance || 0);
    const nextBalance = roundCredits(currentBalance + refundedCredits);

    const { error: walletError } = await supabase
      .from("credit_wallets")
      .update({ balance: nextBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (walletError) {
      throw new Error(walletError.message || "Could not update credit wallet");
    }

    const { error: txError } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      transaction_type: "refund",
      amount: refundedCredits,
      balance_after: nextBalance,
      reference_type: "generation",
      reference_id: referenceId,
      metadata: {
        reason: "generation_failed",
        debitTransactionId: debitTx.id,
        ...(debitTx.metadata && typeof debitTx.metadata === "object" ? debitTx.metadata : {}),
      },
    });

    if (txError) {
      throw new Error(txError.message || "Could not record refund transaction");
    }

    sendJson(res, 200, {
      ok: true,
      refundedCredits,
      balance: nextBalance,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to refund credits",
    });
  }
}