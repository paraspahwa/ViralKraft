import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";

function extractAudioUrl(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const direct = payload.audioUrl || payload.audio_url || payload.url;
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const pipelineResponse = payload.pipelineResponse;
  if (Array.isArray(pipelineResponse)) {
    for (const item of pipelineResponse) {
      const candidate = item?.audio?.[0]?.audioContent || item?.audio?.audioContent;
      if (typeof candidate === "string" && candidate.trim()) {
        if (candidate.startsWith("http")) {
          return candidate;
        }
        return `data:audio/wav;base64,${candidate}`;
      }
    }
  }

  return "";
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
    const apiUrl = process.env.BHASHINI_API_URL || "";
    const apiKey = process.env.BHASHINI_API_KEY || "";

    if (!apiUrl || !apiKey) {
      sendJson(res, 501, {
        error: "Bhashini is not configured. Set BHASHINI_API_URL and BHASHINI_API_KEY.",
      });
      return;
    }

    const body = await readJsonBody(req);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const language = typeof body.language === "string" ? body.language.trim() : "hi-IN";
    const voiceId = typeof body.voiceId === "string" ? body.voiceId.trim() : "default";

    if (!text) {
      sendJson(res, 400, { error: "text is required" });
      return;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text,
        language,
        voiceId,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || "Bhashini request failed";
      sendJson(res, 502, { error: message });
      return;
    }

    const audioUrl = extractAudioUrl(payload);
    if (!audioUrl) {
      sendJson(res, 502, { error: "No audio returned by Bhashini" });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      audioUrl,
      provider: "bhashini",
      language,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to synthesize Bhashini voice",
    });
  }
}
