import { getPublicConfig } from "./_lib/env.js";
import { handleOptions, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  sendJson(res, 200, {
    ok: true,
    service: "viralkraft-backend",
    timestamp: new Date().toISOString(),
    config: getPublicConfig(),
  });
}
