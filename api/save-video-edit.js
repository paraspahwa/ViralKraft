import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";
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

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      sendJson(res, 401, { error: "Authorization token is required" });
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      sendJson(res, 401, { error: "Invalid authorization token" });
      return;
    }

    const userId = userData.user.id;
    const body = await readJsonBody(req);

    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Generated Video";
    const niche = typeof body.niche === "string" && body.niche.trim() ? body.niche.trim() : "General";
    const script = typeof body.script === "string" ? body.script : "";
    const status = body.status === "published" ? "published" : "rendering";

    const metadata = {
      source: "create-video-editor",
      script,
      editSettings: body.editSettings || {},
      audio: body.audio || {},
      updatedAt: new Date().toISOString(),
    };

    if (videoId) {
      const { data, error } = await supabase
        .from("videos")
        .update({
          title,
          niche,
          status,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", videoId)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (error || !data) {
        sendJson(res, 404, { error: error?.message || "Video not found" });
        return;
      }

      sendJson(res, 200, { ok: true, videoId: data.id, mode: "updated" });
      return;
    }

    const { data, error } = await supabase
      .from("videos")
      .insert({
        user_id: userId,
        title,
        niche,
        status,
        platform: "Draft",
        views_count: 0,
        watch_time_pct: null,
        thumb_color: "#A78BFA",
        metadata,
      })
      .select("id")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message || "Failed to save video" });
      return;
    }

    sendJson(res, 200, { ok: true, videoId: data.id, mode: "created" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to save edit settings",
    });
  }
}
