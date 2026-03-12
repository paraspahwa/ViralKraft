import { isIndia } from "./geo.js";

const USD_PER_CREDIT = 0.0999;
const INR_PER_USD = 85;

const SUBSCRIPTION_TIERS = {
  free_trial: {
    name: "Free Trial",
    videos: "3 videos",
    resolution: "480p",
    monthly: { USD: 0, INR: 0 },
    monthlyCostUsd: 0.18,
    features: ["3 videos", "480p export", "No credit card required"],
  },
  starter: {
    name: "Starter",
    videos: "20/month",
    resolution: "480p",
    monthly: { USD: 4.99, INR: 449 },
    monthlyCostUsd: 1.18,
    features: ["20 videos / month", "480p output", "Email support"],
  },
  creator: {
    name: "Creator",
    videos: "50/month",
    resolution: "720p",
    monthly: { USD: 14.99, INR: 1299 },
    monthlyCostUsd: 5.45,
    features: ["50 videos / month", "720p output", "Priority rendering"],
  },
  pro: {
    name: "Pro",
    videos: "100/month",
    resolution: "720p HQ",
    monthly: { USD: 29.99, INR: 2599 },
    monthlyCostUsd: 9.2,
    features: ["100 videos / month", "720p HQ output", "Priority support"],
  },
  studio: {
    name: "Studio",
    videos: "Unlimited",
    resolution: "1080p",
    monthly: { USD: 99.99, INR: 8499 },
    monthlyCostUsd: 50,
    features: ["Unlimited videos", "1080p output", "Team & studio controls"],
  },
};

const CREDIT_PACKS = {
  credits_100: {
    name: "100 Credits",
    credits: 100,
    price: { USD: 9.99, INR: 849 },
    costUsd: 4.99,
  },
  credits_250: {
    name: "250 Credits",
    credits: 250,
    price: { USD: 19.99, INR: 1699 },
    costUsd: 9.99,
  },
  credits_500: {
    name: "500 Credits",
    credits: 500,
    price: { USD: 34.99, INR: 2999 },
    costUsd: 17.49,
  },
  credits_1000: {
    name: "1000 Credits",
    credits: 1000,
    price: { USD: 59.99, INR: 5099 },
    costUsd: 29.99,
  },
};

function resolveCurrency(countryCode) {
  return isIndia(countryCode) ? "INR" : "USD";
}

function marginPercent(priceUsd, costUsd) {
  if (!priceUsd || priceUsd <= 0) {
    return null;
  }
  return Math.round(((priceUsd - costUsd) / priceUsd) * 100);
}

function toCredits(usdAmount) {
  return Number((usdAmount / USD_PER_CREDIT).toFixed(2));
}

export function getPricingCatalog(countryCode = "US") {
  const currency = resolveCurrency(countryCode);

  const subscriptionTiers = Object.entries(SUBSCRIPTION_TIERS).map(([planId, tier]) => ({
    planId,
    name: tier.name,
    videos: tier.videos,
    resolution: tier.resolution,
    billingCycle: "monthly",
    price: tier.monthly[currency],
    priceUsd: tier.monthly.USD,
    costUsd: tier.monthlyCostUsd,
    marginPct: marginPercent(tier.monthly.USD, tier.monthlyCostUsd),
    includedCredits: toCredits(tier.monthly.USD),
    features: tier.features,
  }));

  const creditPacks = Object.entries(CREDIT_PACKS).map(([packId, pack]) => ({
    packId,
    name: pack.name,
    credits: pack.credits,
    price: pack.price[currency],
    priceUsd: pack.price.USD,
    costUsd: pack.costUsd,
    marginPct: marginPercent(pack.price.USD, pack.costUsd),
  }));

  return {
    currency,
    unit: "credits",
    usdPerCredit: USD_PER_CREDIT,
    partner: "razorpay",
    subscriptionTiers,
    creditPacks,
  };
}

export function resolvePlanAmount({ planId, billingCycle, countryCode, purchaseType }) {
  const currency = resolveCurrency(countryCode);
  const cycle = billingCycle === "yearly" ? "yearly" : "monthly";

  if (purchaseType === "credits") {
    const pack = CREDIT_PACKS[planId];
    if (!pack) {
      throw new Error("Unknown credit pack");
    }

    const amountMajor = pack.price[currency];
    return {
      currency,
      amountMajor,
      amountMinor: Math.round(amountMajor * 100),
      planName: pack.name,
      planId,
      billingCycle: "monthly",
      purchaseType: "credits",
      credits: pack.credits,
    };
  }

  const tier = SUBSCRIPTION_TIERS[planId];
  if (!tier) {
    throw new Error("Unknown planId");
  }

  const monthlyAmount = tier.monthly[currency];
  const amountMajor = cycle === "yearly" ? Number((monthlyAmount * 12).toFixed(2)) : monthlyAmount;

  return {
    currency,
    amountMajor,
    amountMinor: Math.round(amountMajor * 100),
    planName: tier.name,
    planId,
    billingCycle: cycle,
    purchaseType: "subscription",
  };
}

export function getPricingMetadata() {
  return {
    usdPerCredit: USD_PER_CREDIT,
    inrPerUsd: INR_PER_USD,
  };
}
