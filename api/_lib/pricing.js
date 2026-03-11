import { isIndia } from "./geo.js";

const PRICING = {
  starter: {
    name: "Starter",
    monthly: { INR: 1499, USD: 29 },
    yearly: { INR: 14990, USD: 290 },
    features: ["20 videos / month", "Basic analytics", "Email support"],
  },
  growth: {
    name: "Growth",
    monthly: { INR: 3999, USD: 79 },
    yearly: { INR: 39990, USD: 790 },
    features: ["100 videos / month", "AI retention optimization", "Priority support"],
  },
  scale: {
    name: "Scale",
    monthly: { INR: 9999, USD: 199 },
    yearly: { INR: 99990, USD: 1990 },
    features: ["Unlimited videos", "Team workspace", "Dedicated success manager"],
  },
};

function resolveCurrency(countryCode) {
  return isIndia(countryCode) ? "INR" : "USD";
}

export function getPricingCatalog(countryCode = "US") {
  const currency = resolveCurrency(countryCode);

  const plans = Object.entries(PRICING).map(([id, plan]) => ({
    planId: id,
    name: plan.name,
    currency,
    monthly: plan.monthly[currency],
    yearly: plan.yearly[currency],
    features: plan.features,
  }));

  return {
    currency,
    partner: "razorpay",
    plans,
  };
}

export function resolvePlanAmount({ planId, billingCycle, countryCode }) {
  const plan = PRICING[planId];
  if (!plan) {
    throw new Error("Unknown planId");
  }

  const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
  const currency = resolveCurrency(countryCode);
  const amountMajor = plan[cycle][currency];

  if (!amountMajor) {
    throw new Error("Pricing is unavailable for selected region");
  }

  return {
    currency,
    amountMajor,
    amountMinor: Math.round(amountMajor * 100),
    planName: plan.name,
    planId,
    billingCycle: cycle,
  };
}
