import { getRequestIp, lookupGeo } from "./_lib/geo.js";
import { handleOptions, sendJson } from "./_lib/http.js";
import { getPricingCatalog } from "./_lib/pricing.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const queryCountry = typeof req.query.country === "string" ? req.query.country : "";
  const countryCode = queryCountry || (await lookupGeo(getRequestIp(req))).countryCode;
  const pricing = getPricingCatalog(countryCode);

  sendJson(res, 200, {
    ok: true,
    countryCode,
    pricing,
  });
}
