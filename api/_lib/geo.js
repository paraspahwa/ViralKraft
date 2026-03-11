const INDIAN_COUNTRY_CODES = new Set(["IN"]);

export function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }

  return "";
}

export async function lookupGeo(ip) {
  if (!ip) {
    return {
      countryCode: "US",
      country: "United States",
      currency: "USD",
      timezone: "UTC",
      source: "fallback",
    };
  }

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { "User-Agent": "viralkraft-backend" },
    });

    if (!response.ok) {
      throw new Error(`Geo lookup failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      ip,
      countryCode: data.country_code || "US",
      country: data.country_name || "United States",
      currency: data.currency || "USD",
      timezone: data.timezone || "UTC",
      city: data.city || "",
      source: "ipapi",
    };
  } catch {
    return {
      ip,
      countryCode: "US",
      country: "United States",
      currency: "USD",
      timezone: "UTC",
      source: "fallback",
    };
  }
}

export function isIndia(countryCode) {
  return INDIAN_COUNTRY_CODES.has((countryCode || "").toUpperCase());
}
