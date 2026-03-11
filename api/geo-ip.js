import { getRequestIp, lookupGeo } from "./_lib/geo.js";
import { handleOptions, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const ip = getRequestIp(req);
  const geo = await lookupGeo(ip);

  sendJson(res, 200, {
    ok: true,
    geo,
  });
}
