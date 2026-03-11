import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useNavigate } from "react-router";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../../lib/supabaseClient";

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

const FALLBACK_PRICING: PricingResponse = {
  ok: true,
  countryCode: "US",
  pricing: {
    currency: "USD",
    partner: "fallback",
    plans: [
      {
        planId: "starter",
        name: "Starter",
        currency: "USD",
        monthly: 29,
        yearly: 290,
        features: ["20 videos / month", "Basic analytics", "Email support"],
      },
      {
        planId: "growth",
        name: "Growth",
        currency: "USD",
        monthly: 79,
        yearly: 790,
        features: ["100 videos / month", "AI retention optimization", "Priority support"],
      },
      {
        planId: "scale",
        name: "Scale",
        currency: "USD",
        monthly: 199,
        yearly: 1990,
        features: ["Unlimited videos", "Team workspace", "Dedicated success manager"],
      },
    ],
  },
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
  action: "close" | "signin" | "dashboard";
};

type UserContext = {
  userId: string | null;
  accessToken: string | null;
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

const CHECKOUT_ORDER_STORAGE_KEY = "viralkraft:lastCheckoutOrder";

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

async function getUserContext(): Promise<UserContext> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return {
        userId: null,
        accessToken: null,
      };
    }

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    return {
      userId: session?.user?.id || null,
      accessToken: session?.access_token || null,
    };
  } catch {
    return {
      userId: null,
      accessToken: null,
    };
  }
}

function persistPendingOrder(orderId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CHECKOUT_ORDER_STORAGE_KEY,
    JSON.stringify({ orderId, createdAt: Date.now() }),
  );
}

function clearPendingOrder() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
}

function readPendingOrderId() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CHECKOUT_ORDER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { orderId?: string; createdAt?: number };
    if (!parsed.orderId || !parsed.createdAt) {
      clearPendingOrder();
      return null;
    }

    const ageMs = Date.now() - parsed.createdAt;
    if (ageMs > 1000 * 60 * 30) {
      clearPendingOrder();
      return null;
    }

    return parsed.orderId;
  } catch {
    clearPendingOrder();
    return null;
  }
}

export function PricingSection() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [yearly, setYearly] = useState(false);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    open: false,
    title: "",
    message: "",
    status: "pending",
    action: "close",
  });

  const billingCycle: BillingCycle = yearly ? "yearly" : "monthly";

  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseBrowserConfig()) {
      setAuthReady(true);
      setIsSignedIn(false);
      return () => {
        mounted = false;
      };
    }

    async function loadAuthState() {
      const user = await getUserContext();
      if (mounted) {
        setIsSignedIn(Boolean(user.userId));
        setAuthReady(true);
      }
    }

    loadAuthState();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthReady(true);
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user?.id));
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchPricing() {
      try {
        setLoadingPricing(true);
        const response = await fetch("/api/pricing");
        if (!response.ok) {
          throw new Error("pricing endpoint unavailable");
        }

        const data = (await response.json()) as PricingResponse;
        if (isMounted) {
          setPricing(data);
        }
      } catch {
        if (isMounted) {
          // Vite-only local dev does not serve serverless /api routes.
          // Use a stable catalog fallback so pricing cards remain usable.
          setPricing(FALLBACK_PRICING);
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

  useEffect(() => {
    const pendingOrderId = readPendingOrderId();
    if (!pendingOrderId) {
      return;
    }

    toast.info("Resuming your last payment check...");
    void pollOrderStatus(pendingOrderId);
    // We only want this to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const user = await getUserContext();

    setCheckoutState({
      open: true,
      title: "Confirming payment",
      message: "We are activating your plan. This usually takes a few seconds.",
      status: "pending",
      action: "close",
    });

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`, {
        headers: user.accessToken
          ? {
              Authorization: `Bearer ${user.accessToken}`,
            }
          : {},
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearPendingOrder();
          setCheckoutState({
            open: true,
            title: "Sign in required",
            message: "Please sign in to verify your order status.",
            status: "failed",
            action: "signin",
          });
          toast.error("Please sign in to verify payment status.");
          return;
        }
        await sleep(2000);
        continue;
      }

      const data = (await response.json()) as OrderStatusResponse;

      if (data.status === "captured") {
        clearPendingOrder();
        setCheckoutState({
          open: true,
          title: "Payment successful",
          message: "Your subscription is active. Continue to your dashboard.",
          status: "success",
          action: "dashboard",
        });
        toast.success("Payment confirmed. Subscription activated.");
        return;
      }

      if (data.status === "failed") {
        clearPendingOrder();
        setCheckoutState({
          open: true,
          title: "Payment failed",
          message: "Your payment did not go through. Please try again.",
          status: "failed",
          action: "close",
        });
        toast.error("Payment failed. Please try again.");
        return;
      }

      await sleep(2000);
    }

    setCheckoutState({
      open: true,
      title: "Still processing",
      message: "Payment is being finalized. You can continue and refresh your dashboard in a moment.",
      status: "pending",
      action: "dashboard",
    });
    toast.info("Payment is still being processed.");
  }

  async function handleCheckout(plan: DisplayPlan) {
    if (!pricing) {
      return;
    }

    try {
      setCheckoutPlanId(plan.backendPlanId);
      toast.info("Initializing secure checkout...");

      const user = await getUserContext();
      const planPricing = backendPlanMap.get(plan.backendPlanId);
      const selectedAmount = billingCycle === "yearly" ? planPricing?.yearly : planPricing?.monthly;

      if (typeof selectedAmount === "number" && selectedAmount > 0 && !user.userId) {
        setCheckoutState({
          open: true,
          title: "Sign in required",
          message: "Please sign in before purchasing a paid plan.",
          status: "failed",
          action: "signin",
        });
        toast.error("Please sign in to continue with paid checkout.");
        return;
      }

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
          userId: user.userId,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Could not create payment order.");
      }

      const orderData = (await orderRes.json()) as OrderResponse;
      persistPendingOrder(orderData.orderId);
      toast.success("Checkout ready.");

      const razorpay = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "ViralKraft",
        description: `${plan.name} (${billingCycle})`,
        theme: { color: "#8B5CF6" },
        handler: () => {
          toast.success("Payment submitted. Verifying status...");
          void pollOrderStatus(orderData.orderId);
        },
        modal: {
          ondismiss: () => {
            setCheckoutState({
              open: true,
              title: "Checkout closed",
              message: "You can resume checkout anytime from this pricing section.",
              status: "failed",
              action: "close",
            });
            toast.info("Checkout closed. You can retry anytime.");
          },
        },
      });

      razorpay.open();
    } catch (error) {
      clearPendingOrder();
      setCheckoutState({
        open: true,
        title: "Checkout failed",
        message: error instanceof Error ? error.message : "Could not start checkout.",
        status: "failed",
        action: "close",
      });
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setCheckoutPlanId(null);
    }
  }

  return (
    <section id="pricing" ref={ref} className="relative py-24 px-4 scroll-mt-24">
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
            const isPaidPlan = Boolean((monthly ?? 0) > 0 || (yearlyPrice ?? 0) > 0);
            const signInRequiredForCheckout = authReady && !isSignedIn && isPaidPlan && plan.backendPlanId !== "starter";

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
                      if (authReady && !isSignedIn) {
                        navigate("/login?next=/dashboard");
                        return;
                      }
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
                  {checkoutPlanId === plan.backendPlanId
                    ? "Opening Checkout..."
                    : signInRequiredForCheckout
                      ? "Sign in to Buy"
                      : plan.cta}
                </motion.button>

                {signInRequiredForCheckout && (
                  <p className="mt-2 text-[0.68rem] text-amber-300/90 text-center">
                    Sign in required for paid checkout
                  </p>
                )}
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
                  setCheckoutState((prev) => ({ ...prev, open: false, action: "close" }));
                  navigate("/dashboard");
                }}
              >
                Continue to Dashboard
              </Button>
            )}

            {checkoutState.action === "signin" && (
              <Button
                onClick={() => {
                  setCheckoutState((prev) => ({ ...prev, open: false, action: "close" }));
                  navigate("/login?next=/dashboard");
                }}
              >
                Sign in to Continue
              </Button>
            )}

            {checkoutState.action === "dashboard" && checkoutState.status !== "success" && (
              <Button
                onClick={() => {
                  setCheckoutState((prev) => ({ ...prev, open: false, action: "close" }));
                  navigate("/dashboard");
                }}
              >
                Go to Dashboard
              </Button>
            )}

            {checkoutState.action === "close" && (
              <Button
                variant="outline"
                onClick={() => setCheckoutState((prev) => ({ ...prev, open: false, action: "close" }))}
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
