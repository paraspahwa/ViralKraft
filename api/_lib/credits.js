export const USD_PER_CREDIT = 0.0999;

export const VIDEO_MODEL_USD_PER_SECOND = {
  "fal-ai/longcat-video/distilled/720p": 0.01,
  "fal-ai/longcat-video/distilled/480p": 0.005,
  "fal-ai/wan/v2.2-5b/text-to-video/fast-wan": 0.0125,
  "fal-ai/ltxv-13b-098-distilled": 0.02,
  "fal-ai/hunyuan-video-v1.5/text-to-video": 0.0075,
  "fal-ai/kling-video/v2.6/pro/text-to-video": 0.07,
  "fal-ai/seedance/v1.5/pro/text-to-video": 0.052,
  "fal-ai/pixverse/v5.6/text-to-video": 0.07,
  "fal-ai/minimax/hailuo-2.3/standard/text-to-video": 0.047,
  "veed/fabric-1.0/text": 0.08,
};

export const ALLOWED_DURATIONS = new Set([10, 30, 60, 120]);

export function roundCredits(value) {
  return Number(value.toFixed(2));
}

export function estimateCreditsForGeneration({ modelId, durationSeconds }) {
  const usdPerSecond = VIDEO_MODEL_USD_PER_SECOND[modelId];
  if (!usdPerSecond) {
    throw new Error("Unsupported video model");
  }

  if (!ALLOWED_DURATIONS.has(durationSeconds)) {
    throw new Error("Unsupported duration");
  }

  const credits = (usdPerSecond * durationSeconds) / USD_PER_CREDIT;
  return roundCredits(credits);
}

export async function getOrCreateWallet(supabase, userId) {
  const { data: existing, error: existingError } = await supabase
    .from("credit_wallets")
    .select("user_id,balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message || "Could not read credit wallet");
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from("credit_wallets")
    .insert({ user_id: userId, balance: 0 })
    .select("user_id,balance")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message || "Could not create credit wallet");
  }

  return created;
}
