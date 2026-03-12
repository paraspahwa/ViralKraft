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

type SubscriptionTier = {
  planId: string;
  name: string;
  videos: string;
  resolution: string;
  billingCycle: "monthly";
  price: number;
  priceUsd: number;
  costUsd: number;
  marginPct: number | null;
  includedCredits: number;
  features: string[];
};

type CreditPack = {
  packId: string;
  name: string;
  credits: number;
  price: number;
  priceUsd: number;
  costUsd: number;
  marginPct: number | null;
};

type PricingResponse = {
  ok: boolean;
  countryCode: string;
  pricing: {
    currency: "USD" | "INR";
    unit: "credits";
    usdPerCredit: number;
    partner: string;
    subscriptionTiers: SubscriptionTier[];
    creditPacks: CreditPack[];
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
  purchaseType: "subscription" | "credits";
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

type CheckoutTarget = {
  id: string;
  label: string;
  purchaseType: "subscription" | "credits";
  amountMajor: number;
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

const FALLBACK_PRICING: PricingResponse = {
  ok: true,
  countryCode: "US",
  pricing: {
    currency: "USD",
    unit: "credits",
    usdPerCredit: 0.0999,
    partner: "fallback",
    subscriptionTiers: [
      {
        planId: "free_trial",
        name: "Free Trial",
        videos: "3 videos",
        resolution: "480p",
        billingCycle: "monthly",
        price: 0,
        priceUsd: 0,
        costUsd: 0.18,
        marginPct: null,
        includedCredits: 0,
        features: ["3 videos", "480p export", "No credit card required"],
      },
      {
        planId: "starter",
        name: "Starter",
        videos: "20/month",
        resolution: "480p",
        billingCycle: "monthly",
        price: 4.99,
        priceUsd: 4.99,
        costUsd: 1.18,
        marginPct: 76,
        includedCredits: 49.95,
        features: ["20 videos / month", "480p output", "Email support"],
      },
      {
        planId: "creator",
        name: "Creator",
        videos: "50/month",
        resolution: "720p",
        billingCycle: "monthly",
        price: 14.99,
        priceUsd: 14.99,
        costUsd: 5.45,
        marginPct: 64,
        includedCredits: 150.05,
        features: ["50 videos / month", "720p output", "Priority rendering"],
      },
      {
        planId: "pro",
        name: "Pro",
        videos: "100/month",
        resolution: "720p HQ",
        billingCycle: "monthly",
        price: 29.99,
        priceUsd: 29.99,
        costUsd: 9.2,
        marginPct: 69,
        includedCredits: 300.2,
        features: ["100 videos / month", "720p HQ output", "Priority support"],
      },
      {
        planId: "studio",
        name: "Studio",
        videos: "Unlimited",
        resolution: "1080p",
        billingCycle: "monthly",
        price: 99.99,
        priceUsd: 99.99,
        costUsd: 50,
        marginPct: 50,
        includedCredits: 1000.9,
        features: ["Unlimited videos", "1080p output", "Team & studio controls"],
      },
    ],
    creditPacks: [
      { packId: "credits_100", name: "100 Credits", credits: 100, price: 9.99, priceUsd: 9.99, costUsd: 4.99, marginPct: 50 },
      { packId: "credits_250", name: "250 Credits", credits: 250, price: 19.99, priceUsd: 19.99, costUsd: 9.99, marginPct: 50 },
      { packId: "credits_500", name: "500 Credits", credits: 500, price: 34.99, priceUsd: 34.99, costUsd: 17.49, marginPct: 50 },
      { packId: "credits_1000", name: "1000 Credits", credits: 1000, price: 59.99, priceUsd: 59.99, costUsd: 29.99, marginPct: 50 },
    ],
  },
};

const CHECKOUT_ORDER_STORAGE_KEY = "viralkraft:lastCheckoutOrder";

function formatMoney(currency: "USD" | "INR", value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNum(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
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
      return { userId: null, accessToken: null };
    }

    const { data } = await supabase.auth.getSession();
    const session = data.session;
    return {
      userId: session?.user?.id || null,
      accessToken: session?.access_token || null,
    };
  } catch {
    return { userId: null, accessToken: null };
  }
}

function persistPendingOrder(orderId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CHECKOUT_ORDER_STORAGE_KEY,
    JSON.stringify({ orderId, createdAt: Date.now() }),
  );
}

function clearPendingOrder() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
}

function readPendingOrderId() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(CHECKOUT_ORDER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { orderId?: string; createdAt?: number };
    if (!parsed.orderId || !parsed.createdAt) {
      clearPendingOrder();
      return null;
    }

    if (Date.now() - parsed.createdAt > 1000 * 60 * 30) {
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
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [checkoutItemId, setCheckoutItemId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    open: false,
    title: "",
    message: "",
    status: "pending",
    action: "close",
  });

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

    void loadAuthState();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthReady(true);
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
          setPricing(FALLBACK_PRICING);
        }
      } finally {
        if (isMounted) {
          setLoadingPricing(false);
        }
      }
    }

    void fetchPricing();
    return () => {
      isMounted = false;
    };
  }, []);

  const subscriptionTiers = useMemo(
    () => pricing?.pricing.subscriptionTiers || FALLBACK_PRICING.pricing.subscriptionTiers,
    [pricing],
  );

  const creditPacks = useMemo(
    () => pricing?.pricing.creditPacks || FALLBACK_PRICING.pricing.creditPacks,
    [pricing],
  );

  const currency = pricing?.pricing.currency || "USD";

  useEffect(() => {
    const pendingOrderId = readPendingOrderId();
    if (!pendingOrderId) return;

    toast.info("Resuming your last payment check...");
    void pollOrderStatus(pendingOrderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pollOrderStatus(orderId: string) {
    const user = await getUserContext();

    setCheckoutState({
      open: true,
      title: "Confirming payment",
      message: "We are activating your purchase. This usually takes a few seconds.",
      status: "pending",
      action: "close",
    });

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`, {
        headers: user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {},
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
          message: data.purchaseType === "credits"
            ? "Your credit pack payment is confirmed."
            : "Your subscription is active. Continue to your dashboard.",
          status: "success",
          action: "dashboard",
        });
        toast.success("Payment confirmed.");
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

  async function handleCheckout(target: CheckoutTarget) {
    try {
      setCheckoutItemId(target.id);
      toast.info("Initializing secure checkout...");

      const user = await getUserContext();
      if (target.amountMajor > 0 && !user.userId) {
        setCheckoutState({
          open: true,
          title: "Sign in required",
          message: "Please sign in before purchasing.",
          status: "failed",
          action: "signin",
        });
        toast.error("Please sign in to continue checkout.");
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
          planId: target.id,
          purchaseType: target.purchaseType,
          billingCycle: "monthly",
          countryCode: pricing?.countryCode || "US",
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
        description: target.label,
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
      setCheckoutItemId(null);
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

      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            Simple, Transparent Pricing
          </span>
          <h2
            className="text-white mb-3"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Subscription Tiers + Credit Packs
          </h2>
          <p className="text-cyan-300/85 text-xs">1 credit = $0.0999</p>
          <p className="text-white/45 text-xs mt-2">Choose a subscription or buy credits anytime.</p>
        </motion.div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Subscriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {subscriptionTiers.map((tier, i) => {
              const icon = tier.planId === "creator" ? Zap : tier.planId === "studio" ? Building2 : Sparkles;
              const Icon = icon;
              const isPopular = tier.planId === "creator";
              const isFree = tier.price <= 0;
              const requiresSignIn = authReady && !isSignedIn && !isFree;

              return (
                <motion.div
                  key={tier.planId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className={`relative rounded-2xl p-5 border ${isPopular ? "border-purple-500/40 bg-purple-500/10" : "border-white/10 bg-white/5"}`}
                >
                  {isPopular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[0.65rem] bg-purple-500 text-white">Most Popular</span>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{tier.name}</p>
                      <p className="text-white/50 text-[0.68rem]">{tier.videos} • {tier.resolution}</p>
                    </div>
                  </div>

                  <p className="text-white text-2xl font-extrabold leading-none">{formatMoney(currency, tier.price)}</p>
                  <p className="text-white/45 text-[0.7rem] mt-1">per month</p>

                  <div className="mt-3 space-y-1 text-[0.7rem]">
                    <p className="text-cyan-300">Credits equivalent: {formatNum(tier.includedCredits)}</p>
                  </div>

                  <ul className="mt-3 mb-4 space-y-1.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[0.7rem] text-white/65">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-cyan-300" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    disabled={loadingPricing || checkoutItemId === tier.planId}
                    onClick={() => {
                      if (tier.planId === "free_trial") {
                        navigate("/login?next=/dashboard");
                        return;
                      }

                      void handleCheckout({
                        id: tier.planId,
                        label: `${tier.name} subscription`,
                        purchaseType: "subscription",
                        amountMajor: tier.price,
                      });
                    }}
                  >
                    {checkoutItemId === tier.planId
                      ? "Opening Checkout..."
                      : requiresSignIn
                        ? "Sign in to Buy"
                        : tier.planId === "free_trial"
                          ? "Start Free Trial"
                          : `Choose ${tier.name}`}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Pay-Per-Use Credits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {creditPacks.map((pack, i) => {
              const requiresSignIn = authReady && !isSignedIn;
              return (
                <motion.div
                  key={pack.packId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="rounded-2xl p-5 border border-cyan-500/25 bg-cyan-500/5"
                >
                  <p className="text-white font-semibold">{pack.name}</p>
                  <p className="text-white/50 text-xs mt-0.5">{pack.credits} credits</p>
                  <p className="text-white text-2xl font-extrabold mt-2">{formatMoney(currency, pack.price)}</p>

                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    disabled={loadingPricing || checkoutItemId === pack.packId}
                    onClick={() => {
                      void handleCheckout({
                        id: pack.packId,
                        label: `${pack.name} credit pack`,
                        purchaseType: "credits",
                        amountMajor: pack.price,
                      });
                    }}
                  >
                    {checkoutItemId === pack.packId
                      ? "Opening Checkout..."
                      : requiresSignIn
                        ? "Sign in to Buy"
                        : `Buy ${pack.credits} Credits`}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
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
            <DialogDescription className="text-white/65">{checkoutState.message}</DialogDescription>
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
