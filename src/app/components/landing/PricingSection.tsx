import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useNavigate } from "react-router";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

type BillingCycle = "monthly" | "yearly";

type BackendPlan = {
  planId: string;
  name: string;
  currency: "INR" | "USD";
  monthly: number;
  yearly: number;
  features: string[];
};

type PricingResponse = {
  ok: boolean;
  countryCode: string;
  pricing: {
    currency: "INR" | "USD";
    partner: string;
    plans: BackendPlan[];
  };
};

type OrderResponse = {
  ok: boolean;
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
  billingCycle: BillingCycle;
  razorpayKeyId: string;
};

type OrderStatusResponse = {
  ok: boolean;
  orderId: string;
  status: string;
  subscriptionStatus: string | null;
  updatedAt: string;
  planId: string;
  billingCycle: BillingCycle;
};

type CheckoutState = {
  open: boolean;
  title: string;
  message: string;
  status: "pending" | "success" | "failed";
};

type DisplayPlan = {
  name: string;
  backendPlanId: string;
  icon: typeof Sparkles;
  description: string;
  color: string;
  popular: boolean;
  features: string[];
  cta: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const displayPlans: DisplayPlan[] = [
  {
    name: "Starter",
    backendPlanId: "starter",
    icon: Sparkles,
    description: "Perfect for creators just getting started",
    color: "#A78BFA",
    popular: false,
    features: [
      "20 videos / month",
      "Basic analytics",
      "Email support",
      "Basic captions",
      "TikTok & Reels export",
      "Watermarked output"
    ],
    cta: "Start Starter"
  },
  {
    name: "Growth",
    backendPlanId: "growth",
    icon: Zap,
    description: "For creators serious about going viral",
    color: "#A78BFA",
    popular: true,
    features: [
      "100 videos / month",
      "AI retention optimization",
      "Priority support",
      "Animated captions",
      "5 platform export"
    ],
    cta: "Start Growth"
  },
  {
    name: "Scale",
    backendPlanId: "scale",
    icon: Building2,
    description: "For teams, agencies & brands",
    color: "#06B6D4",
    popular: false,
    features: [
      "Unlimited videos",
      "Team workspace",
      "Dedicated success manager",
      "White-label branding",
      "API access"
    ],
    cta: "Start Scale"
  }
];

function formatCurrency(currency: "INR" | "USD", value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PricingSection() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [yearly, setYearly] = useState(false);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    open: false,
    title: "",
    message: "",
    status: "pending",
  });

  const billingCycle: BillingCycle = yearly ? "yearly" : "monthly";

  useEffect(() => {
    let isMounted = true;

    async function fetchPricing() {
      try {
        setLoadingPricing(true);
        const response = await fetch("/api/pricing");
        const data = (await response.json()) as PricingResponse;

        if (isMounted && response.ok) {
          setPricing(data);
        }
      } catch {
        if (isMounted) {
          setPricing(null);
        }
      } finally {
        if (isMounted) {
          setLoadingPricing(false);
        }
      }
    }

    fetchPricing();
    return () => {
      isMounted = false;
    };
  }, []);

  const backendPlanMap = useMemo(() => {
    const map = new Map<string, BackendPlan>();
    const plans = pricing?.pricing.plans || [];
    plans.forEach((plan) => {
      map.set(plan.planId, plan);
    });
    return map;
  }, [pricing]);

  async function pollOrderStatus(orderId: string) {
    setCheckoutState({
      open: true,
      title: "Confirming payment",
      message: "We are activating your plan. This usually takes a few seconds.",
      status: "pending",
    });

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`);

      if (!response.ok) {
        await sleep(2000);
        continue;
      }

      const data = (await response.json()) as OrderStatusResponse;

      if (data.status === "captured") {
        setCheckoutState({
          open: true,
          title: "Payment successful",
          message: "Your subscription is active. Continue to your dashboard.",
          status: "success",
        });
        return;
      }

      if (data.status === "failed") {
        setCheckoutState({
          open: true,
          title: "Payment failed",
          message: "Your payment did not go through. Please try again.",
          status: "failed",
        });
        return;
      }

      await sleep(2000);
    }

    setCheckoutState({
      open: true,
      title: "Still processing",
      message: "Payment is being finalized. You can continue and refresh your dashboard in a moment.",
      status: "pending",
    });
  }

  async function handleCheckout(plan: DisplayPlan) {
    if (!pricing) {
      return;
    }

    try {
      setCheckoutPlanId(plan.backendPlanId);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.backendPlanId,
          billingCycle,
          countryCode: pricing.countryCode,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Could not create payment order.");
      }

      const orderData = (await orderRes.json()) as OrderResponse;

      const razorpay = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "ViralKraft",
        description: `${plan.name} (${billingCycle})`,
        theme: { color: "#8B5CF6" },
        handler: () => {
          void pollOrderStatus(orderData.orderId);
        },
        modal: {
          ondismiss: () => {
            setCheckoutState({
              open: true,
              title: "Checkout closed",
              message: "You can resume checkout anytime from this pricing section.",
              status: "failed",
            });
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setCheckoutState({
        open: true,
        title: "Checkout failed",
        message: error instanceof Error ? error.message : "Could not start checkout.",
        status: "failed",
      });
    } finally {
      setCheckoutPlanId(null);
    }
  }

  return (
    <section id="pricing" ref={ref} className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            💎 Transparent Pricing — No Hidden Fees, Ever
          </span>
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Simple Pricing.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A78BFA, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Instant Refunds.
            </span>{" "}
            No Surprises.
          </h2>
          <p className="text-white/50 text-sm mb-6">Unlike competitors — we show you exactly what you pay. Cancel anytime in 2 clicks.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-white/8">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm transition-all ${
                !yearly ? "bg-purple-500/30 text-purple-200 border border-purple-500/30" : "text-white/40"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all ${
                yearly ? "bg-purple-500/30 text-purple-200 border border-purple-500/30" : "text-white/40"
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 rounded-full text-[0.6rem] bg-green-500/20 text-green-400 border border-green-500/25">
                Save 35%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayPlans.map((plan, i) => {
            const Icon = plan.icon;
            const backendPlan = backendPlanMap.get(plan.backendPlanId);
            const currency = pricing?.pricing.currency || "USD";
            const monthly = backendPlan?.monthly;
            const yearlyPrice = backendPlan?.yearly;
            const currentPrice = billingCycle === "yearly" ? yearlyPrice : monthly;
            const hasPrice = typeof currentPrice === "number";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-6 border overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? "border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-purple-900/5"
                    : "border-white/8 bg-white/3"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-medium"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Top border glow */}
                <div
                  className="absolute top-0 left-4 right-4 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${plan.color}60, transparent)` }}
                />

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}25` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3
                      className="text-white"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1rem" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-white/35 text-xs">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-end gap-1.5">
                    <span
                      className="text-white"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "2.8rem",
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {hasPrice ? formatCurrency(currency, currentPrice) : loadingPricing ? "..." : "N/A"}
                    </span>
                    {hasPrice && (
                      <span className="text-white/35 text-sm mb-1">/month</span>
                    )}
                  </div>
                  {hasPrice && billingCycle === "yearly" && typeof monthly === "number" && typeof yearlyPrice === "number" && (
                    <p className="text-green-400 text-xs mt-1">
                      Save {formatCurrency(currency, (monthly - yearlyPrice) * 12)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-white/60 text-xs">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loadingPricing || !backendPlan || checkoutPlanId === plan.backendPlanId}
                  onClick={() => {
                    if (plan.backendPlanId === "starter") {
                      navigate("/dashboard");
                      return;
                    }
                    void handleCheckout(plan);
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={
                    plan.popular
                      ? {
                          background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                          color: "white",
                          boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  {checkoutPlanId === plan.backendPlanId ? "Opening Checkout..." : plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-wrap justify-center gap-5"
        >
          {[
            "✅ No credit card for free trial",
            "✅ Instant refunds within 48h",
            "✅ Cancel in 2 clicks",
            "✅ No hidden fees. Ever.",
          ].map((t) => (
            <span key={t} className="text-white/35 text-xs">{t}</span>
          ))}
        </motion.div>
      </div>

      <Dialog
        open={checkoutState.open}
        onOpenChange={(open) => {
          if (!open) {
            setCheckoutState((prev) => ({ ...prev, open: false }));
          }
        }}
      >
        <DialogContent className="border-white/15 bg-[#0f0b22] text-white">
          <DialogHeader>
            <DialogTitle>{checkoutState.title}</DialogTitle>
            <DialogDescription className="text-white/65">
              {checkoutState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {checkoutState.status === "success" && (
              <Button
                onClick={() => {
                  setCheckoutState((prev) => ({ ...prev, open: false }));
                  navigate("/dashboard");
                }}
              >
                Continue to Dashboard
              </Button>
            )}

            {checkoutState.status !== "success" && (
              <Button
                variant="outline"
                onClick={() => setCheckoutState((prev) => ({ ...prev, open: false }))}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
