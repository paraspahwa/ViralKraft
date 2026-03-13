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

    const wallet = await getOrCreateWallet(supabase, userData.user.id);

    sendJson(res, 200, {
      ok: true,
      balance: Number(wallet.balance || 0),
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load wallet balance",
    });
  }
}
