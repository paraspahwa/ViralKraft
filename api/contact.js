import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    const body = await readJsonBody(req);

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!fullName || !email || !topic || !message) {
      sendJson(res, 400, { error: "All fields are required" });
      return;
    }

    if (!isValidEmail(email)) {
      sendJson(res, 400, { error: "A valid email is required" });
      return;
    }

    if (message.length < 15) {
      sendJson(res, 400, { error: "Message should be at least 15 characters" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("contact_inquiries").insert({
      full_name: fullName,
      email,
      topic,
      message,
      source: "footer-contact-page",
      status: "new",
    });

    if (error) {
      throw new Error(error.message);
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to submit message",
    });
  }
}
