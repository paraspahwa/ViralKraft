import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";

function getScriptFromCompletion(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: "OPENAI_API_KEY is not configured" });
      return;
    }

    const body = await readJsonBody(req);
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";

    if (!topic) {
      sendJson(res, 400, { error: "topic is required" });
      return;
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are a viral short-form script writer. Return only a ready-to-use 60-second script with clear sections: HOOK (0-3s), BODY (3-45s), RE-HOOK (45s), CTA (55-60s). Keep it punchy and creator-friendly.",
          },
          {
            role: "user",
            content: `Topic: ${topic}\n\nWrite a high-retention script optimized for TikTok/Reels/Shorts.`,
          },
        ],
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const errorMessage = payload?.error?.message || "OpenAI request failed";
      sendJson(res, 502, { error: errorMessage });
      return;
    }

    const script = getScriptFromCompletion(payload);
    if (!script) {
      sendJson(res, 502, { error: "Empty script returned by model" });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      model,
      script,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to generate script",
    });
  }
}