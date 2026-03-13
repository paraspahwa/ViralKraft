import { ALLOWED_DURATIONS, VIDEO_MODEL_USD_PER_SECOND } from "./_lib/credits.js";
import { handleOptions, readJsonBody, sendJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";

const FAL_BASE_URL = "https://queue.fal.run";

function getBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findFirstUrl(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.startsWith("http") ? value : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findFirstUrl(item);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (typeof value === "object") {
    const directCandidates = [
      value.video,
      value.video_url,
      value.url,
      value.file_url,
      value.media_url,
      value.output,
      value.outputs,
      value.data,
      value.result,
    ];

    for (const candidate of directCandidates) {
      const nested = findFirstUrl(candidate);
      if (nested) {
        return nested;
      }
    }

    for (const key of Object.keys(value)) {
      const nested = findFirstUrl(value[key]);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function getPromptFromBody(body) {
  const rawScript = typeof body.script === "string" ? body.script.trim() : "";
  const rawTopic = typeof body.topic === "string" ? body.topic.trim() : "";
  const selectedDurationSeconds = Number(body.durationSeconds);

  const basePrompt = rawScript || rawTopic;
  if (!basePrompt) {
    return "";
  }

  return `${basePrompt}\n\nCreate a ${selectedDurationSeconds}s vertical 9:16 short-form video with clear scene transitions.`;
}

async function postFalRequest({ apiKey, modelId, prompt }) {
  const submitResponse = await fetch(`${FAL_BASE_URL}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "9:16",
    }),
  });

  const submitPayload = await submitResponse.json().catch(() => ({}));
  if (!submitResponse.ok) {
    const message =
      submitPayload?.detail ||
      submitPayload?.error ||
      submitPayload?.message ||
      "Fal request submission failed";
    throw new Error(String(message));
  }

  const requestId = submitPayload?.request_id;
  if (!requestId) {
    throw new Error("Fal submission did not return request_id");
  }

  const statusUrl = submitPayload?.status_url || `${FAL_BASE_URL}/${modelId}/requests/${requestId}/status`;
  const responseUrl = submitPayload?.response_url || `${FAL_BASE_URL}/${modelId}/requests/${requestId}`;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const statusResponse = await fetch(statusUrl, {
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    });

    const statusPayload = await statusResponse.json().catch(() => ({}));
    const status = String(statusPayload?.status || "").toUpperCase();

    if (status === "COMPLETED") {
      const resultResponse = await fetch(responseUrl, {
        headers: {
          Authorization: `Key ${apiKey}`,
        },
      });

      const resultPayload = await resultResponse.json().catch(() => ({}));
      if (!resultResponse.ok) {
        const message =
          resultPayload?.detail ||
          resultPayload?.error ||
          resultPayload?.message ||
          "Fal result fetch failed";
        throw new Error(String(message));
      }

      const output = resultPayload?.output ?? resultPayload;
      const videoUrl = findFirstUrl(output);
      if (!videoUrl) {
        throw new Error("Fal completed but no video URL was returned");
      }

      return { requestId, videoUrl };
    }

    if (status === "FAILED" || status === "CANCELLED") {
      const message =
        statusPayload?.error ||
        statusPayload?.detail ||
        statusPayload?.message ||
        "Fal generation failed";
      throw new Error(String(message));
    }

    await sleep(3000);
  }

  throw new Error("Fal generation timeout: request did not complete in time");
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
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: "FAL_API_KEY is not configured" });
      return;
    }

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
    const prompt = getPromptFromBody(body);

    if (!VIDEO_MODEL_USD_PER_SECOND[modelId]) {
      sendJson(res, 400, { error: "Unsupported video model" });
      return;
    }

    if (!ALLOWED_DURATIONS.has(durationSeconds)) {
      sendJson(res, 400, { error: "Unsupported duration" });
      return;
    }

    if (!prompt) {
      sendJson(res, 400, { error: "topic or script is required" });
      return;
    }

    const falResult = await postFalRequest({ apiKey, modelId, prompt });

    sendJson(res, 200, {
      ok: true,
      provider: "fal.ai",
      requestId: falResult.requestId,
      videoUrl: falResult.videoUrl,
      modelId,
      durationSeconds,
    });
  } catch (error) {
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : "Failed to generate video",
    });
  }
}