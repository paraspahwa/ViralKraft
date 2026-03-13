import {
  estimateCreditsForGeneration,
  getOrCreateWallet,
  roundCredits,
} from "./_lib/credits.js";
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
    const modelId = typeof body.modelId === "string" ? body.modelId : "";
    const durationSeconds = Number(body.durationSeconds);
    const referenceId = typeof body.referenceId === "string" ? body.referenceId : null;

    const creditsToDeduct = estimateCreditsForGeneration({ modelId, durationSeconds });
    const userId = userData.user.id;

    if (referenceId) {
      const { data: existingTx } = await supabase
        .from("credit_transactions")
        .select("id,amount,balance_after")
        .eq("user_id", userId)
        .eq("transaction_type", "video_generation_debit")
        .eq("reference_type", "generation")
        .eq("reference_id", referenceId)
        .maybeSingle();

      if (existingTx) {
        sendJson(res, 200, {
          ok: true,
          deductedCredits: Math.abs(Number(existingTx.amount || 0)),
          balance: Number(existingTx.balance_after || 0),
          reused: true,
        });
        return;
      }
    }

    const wallet = await getOrCreateWallet(supabase, userId);
    const currentBalance = Number(wallet.balance || 0);

    if (currentBalance < creditsToDeduct) {
      sendJson(res, 402, {
        error: "Insufficient credits",
        requiredCredits: creditsToDeduct,
        availableCredits: currentBalance,
      });
      return;
    }

    const nextBalance = roundCredits(currentBalance - creditsToDeduct);

    const { error: walletError } = await supabase
      .from("credit_wallets")
      .update({ balance: nextBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (walletError) {
      throw new Error(walletError.message || "Could not update credit wallet");
    }

    const { error: txError } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      transaction_type: "video_generation_debit",
      amount: -creditsToDeduct,
      balance_after: nextBalance,
      reference_type: "generation",
      reference_id: referenceId,
      metadata: {
        modelId,
        durationSeconds,
      },
    });

    if (txError) {
      throw new Error(txError.message || "Could not record credit transaction");
    }

    sendJson(res, 200, {
      ok: true,
      deductedCredits: creditsToDeduct,
      balance: nextBalance,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to consume credits",
    });
  }
}
