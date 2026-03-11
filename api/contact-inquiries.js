import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

const ALLOWED_STATUSES = new Set(["new", "reviewed", "resolved", "spam"]);

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

async function requireAdminUser(supabase, req, res) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    sendJson(res, 401, { error: "Authorization token is required" });
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user?.id) {
    sendJson(res, 401, { error: "Invalid authorization token" });
    return null;
  }

  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (adminIds.length === 0) {
    sendJson(res, 500, { error: "ADMIN_USER_IDS is not configured" });
    return null;
  }

  if (!adminIds.includes(userData.user.id)) {
    sendJson(res, 403, { error: "Not authorized to manage inquiries" });
    return null;
  }

  return userData.user.id;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const adminUserId = await requireAdminUser(supabase, req, res);
  if (!adminUserId) {
    return;
  }

  try {
    if (req.method === "GET") {
      const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
      const limitRaw = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : 50;
      const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 200)) : 50;

      let query = supabase
        .from("contact_inquiries")
        .select("id,full_name,email,topic,message,status,source,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status && ALLOWED_STATUSES.has(status)) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }

      sendJson(res, 200, { ok: true, inquiries: data || [] });
      return;
    }

    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      const id = typeof body.id === "string" ? body.id.trim() : "";
      const status = typeof body.status === "string" ? body.status.trim() : "";

      if (!id || !status) {
        sendJson(res, 400, { error: "id and status are required" });
        return;
      }

      if (!ALLOWED_STATUSES.has(status)) {
        sendJson(res, 400, { error: "Invalid status" });
        return;
      }

      const { data, error } = await supabase
        .from("contact_inquiries")
        .update({
          status,
          updated_at: new Date().toISOString(),
          metadata: { updatedBy: adminUserId },
        })
        .eq("id", id)
        .select("id,status")
        .single();

      if (error || !data) {
        throw new Error(error?.message || "Could not update inquiry");
      }

      sendJson(res, 200, { ok: true, inquiry: data });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to process inquiry request",
    });
  }
}
