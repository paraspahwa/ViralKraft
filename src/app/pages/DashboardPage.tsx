import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CinematicBackground } from "../components/CinematicBackground";
import { AppNavbar } from "../components/AppNavbar";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";
import {
  Sparkles, TrendingUp, Play, Eye, Clock, MoreHorizontal,
  Zap, Brain, Plus, BarChart3, Video, Star, Flame,
  Globe2, Smartphone, Monitor, ArrowUpRight, Bell, Settings
} from "lucide-react";

const recentVideos = [
  { id: 1, title: "Top 10 Passive Income Ideas", niche: "Finance", status: "published", views: "124K", watchTime: "68%", platform: "TikTok", thumb: "#A78BFA", createdAt: "2h ago" },
  { id: 2, title: "AI Tools That Will Replace Jobs", niche: "Tech", status: "published", views: "89K", watchTime: "72%", platform: "Reels", thumb: "#06B6D4", createdAt: "1d ago" },
  { id: 3, title: "Ancient Rome's Dark Secret", niche: "History", status: "published", views: "212K", watchTime: "81%", platform: "Shorts", thumb: "#EC4899", createdAt: "3d ago" },
  { id: 4, title: "How to Make $500/Day Online", niche: "Finance", status: "rendering", views: "—", watchTime: "—", platform: "TikTok", thumb: "#34D399", createdAt: "Just now" },
  { id: 5, title: "Psychology of Manipulation", niche: "Psychology", status: "published", views: "341K", watchTime: "76%", platform: "TikTok", thumb: "#F59E0B", createdAt: "5d ago" },
];

const trendingTopics = [
  { topic: "AI replacing programmers 2026", heat: 98, niche: "Tech", growth: "+340%" },
  { topic: "Hidden fees in banking apps", heat: 94, niche: "Finance", growth: "+210%" },
  { topic: "Sleep debt health effects", heat: 88, niche: "Health", growth: "+180%" },
  { topic: "China's ghost cities 2026", heat: 85, niche: "History", growth: "+165%" },
  { topic: "Passive income myths busted", heat: 82, niche: "Finance", growth: "+140%" },
];

const statCards = [
  { label: "Total Views", value: "2.8M", change: "+23%", icon: Eye, color: "#A78BFA" },
  { label: "Avg Watch Time", value: "74%", change: "+8%", icon: Clock, color: "#06B6D4" },
  { label: "Videos Created", value: "47", change: "+12", icon: Video, color: "#EC4899" },
  { label: "Retention Score", value: "A+", change: "Top 3%", icon: Brain, color: "#34D399" },
];

function formatCompactViews(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}

type DashboardVideo = {
  id: string | number;
  title: string;
  niche: string;
  status: "published" | "rendering";
  views: string;
  watchTime: string;
  platform: string;
  thumb: string;
  createdAt: string;
};

type VideoRow = {
  id: string;
  title: string;
  niche: string;
  status: "published" | "rendering";
  views_count: number | null;
  watch_time_pct: number | null;
  platform: string | null;
  thumb_color: string | null;
  created_at: string;
  user_id: string;
};

function toRelativeTime(timestamp: string) {
  const ms = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapVideoRow(row: VideoRow): DashboardVideo {
  return {
    id: row.id,
    title: row.title,
    niche: row.niche,
    status: row.status,
    views: row.views_count === null ? "—" : formatCompactViews(row.views_count),
    watchTime: row.watch_time_pct === null ? "—" : `${row.watch_time_pct}%`,
    platform: row.platform || "TikTok",
    thumb: row.thumb_color || "#A78BFA",
    createdAt: toRelativeTime(row.created_at),
  };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "published" | "rendering">("all");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [liveRecentVideos, setLiveRecentVideos] = useState<DashboardVideo[]>(recentVideos);
  const [debugSyncing, setDebugSyncing] = useState(false);

  async function getSessionWithRetry() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return null;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        return data.session;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }

    return null;
  }

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!hasSupabaseBrowserConfig()) {
        if (mounted) {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
        navigate("/login?next=/dashboard", { replace: true });
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (mounted) {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
        navigate("/login?next=/dashboard", { replace: true });
        return;
      }

      const session = await getSessionWithRetry();
      const authed = Boolean(session?.user?.id);

      if (!mounted) {
        return;
      }

      setIsAuthorized(authed);
      setUserId(session?.user?.id || null);
      setIsCheckingAuth(false);

      if (!authed) {
        navigate("/login?next=/dashboard", { replace: true });
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!isAuthorized || !userId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    const loadInitial = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id,title,niche,status,views_count,watch_time_pct,platform,thumb_color,created_at,user_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!mounted || error || !data) {
        return;
      }

      if (data.length > 0) {
        setLiveRecentVideos(data.map((row) => mapVideoRow(row as VideoRow)));
      }
    };

    void loadInitial();

    const channel = supabase
      .channel(`dashboard-videos-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const eventType = payload.eventType;
          if (eventType === "DELETE") {
            const oldRow = payload.old as { id?: string };
            if (!oldRow?.id) {
              return;
            }
            setLiveRecentVideos((current) => current.filter((video) => String(video.id) !== String(oldRow.id)));
            return;
          }

          const nextRow = (payload.new || null) as VideoRow | null;
          if (!nextRow?.id) {
            return;
          }

          const mapped = mapVideoRow(nextRow);
          setLiveRecentVideos((current) => {
            const withoutCurrent = current.filter((video) => String(video.id) !== String(mapped.id));
            return [mapped, ...withoutCurrent].slice(0, 20);
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [isAuthorized, userId]);

  async function runRealtimeDemo() {
    if (!import.meta.env.DEV) {
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to run realtime demo.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase client not available.");
      return;
    }

    try {
      setDebugSyncing(true);

      const now = Date.now();
      const title = `Realtime Demo ${new Date(now).toLocaleTimeString()}`;
      const nicheOptions = ["Tech", "Finance", "Education", "History"];
      const platformOptions = ["TikTok", "Reels", "Shorts"];
      const colorOptions = ["#A78BFA", "#06B6D4", "#EC4899", "#34D399", "#F59E0B"];

      const { data: inserted, error: insertError } = await supabase
        .from("videos")
        .insert({
          user_id: userId,
          title,
          niche: nicheOptions[Math.floor(Math.random() * nicheOptions.length)],
          status: "rendering",
          platform: platformOptions[Math.floor(Math.random() * platformOptions.length)],
          views_count: 0,
          watch_time_pct: null,
          thumb_color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
          metadata: { source: "dashboard-dev-realtime-demo" },
        })
        .select("id")
        .single();

      if (insertError || !inserted?.id) {
        throw new Error(insertError?.message || "Failed to insert demo video");
      }

      // Small delay to visibly demonstrate a second realtime update.
      await new Promise((resolve) => window.setTimeout(resolve, 1200));

      const { error: updateError } = await supabase
        .from("videos")
        .update({
          status: "published",
          views_count: 1250 + Math.floor(Math.random() * 900),
          watch_time_pct: 62 + Math.floor(Math.random() * 20),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id)
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(updateError.message || "Failed to update demo video");
      }

      toast.success("Realtime demo event sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Realtime demo failed");
    } finally {
      setDebugSyncing(false);
    }
  }

  if (isCheckingAuth || !isAuthorized) {
    return (
      <div className="relative min-h-screen" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
        <CinematicBackground />
        <div className="relative" style={{ zIndex: 1 }}>
          <AppNavbar />
        </div>
      </div>
    );
  }

  const filtered = liveRecentVideos.filter(
    (v) => activeTab === "all" || v.status === activeTab
  );

  return (
    <div
      className="relative min-h-screen"
      style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
    >
      <CinematicBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <AppNavbar />

        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
          {/* Header */}
          <div className="flex items-center justify-between py-6 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white mb-1"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "1.6rem" }}
              >
                Welcome back, Creator 👋
              </motion.h1>
              <p className="text-white/40 text-sm">Your RetentionAI™ score is in the top 3% this week</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
              </button>
              <button className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/create")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                }}
              >
                <Zap className="w-3.5 h-3.5" />
                New Video
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-white/8 bg-white/3 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${s.color}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <span className="text-green-400 text-xs">{s.change}</span>
                  </div>
                  <p
                    className="text-white mb-0.5"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.6rem", lineHeight: 1 }}
                  >
                    {s.value}
                  </p>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Videos list */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden"
              >
                <div className="flex items-center justify-between p-5 border-b border-white/6">
                  <h2
                    className="text-white"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
                  >
                    Recent Videos
                  </h2>
                  <div className="flex items-center gap-2">
                    {import.meta.env.DEV && (
                      <button
                        onClick={() => void runRealtimeDemo()}
                        disabled={debugSyncing}
                        className="px-2.5 py-1 rounded-lg text-[0.65rem] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 disabled:opacity-60"
                      >
                        {debugSyncing ? "Syncing..." : "Realtime Demo"}
                      </button>
                    )}

                    <div className="flex gap-1">
                    {(["all", "published", "rendering"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all capitalize ${
                          activeTab === tab
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/25"
                            : "text-white/35 hover:text-white/60"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {filtered.map((video, i) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-14 h-20 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${video.thumb}30, ${video.thumb}10)`,
                          border: `1px solid ${video.thumb}25`,
                        }}
                      >
                        <Play className="w-5 h-5 opacity-60" style={{ color: video.thumb }} />
                        <div
                          className="absolute bottom-1 left-1 right-1 text-center text-[0.5rem] text-white/50 leading-tight px-0.5"
                        >
                          {video.platform}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-white text-sm mb-1 truncate"
                          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500 }}
                        >
                          {video.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-1.5 py-0.5 rounded text-[0.6rem]"
                            style={{ background: `${video.thumb}15`, color: video.thumb }}
                          >
                            {video.niche}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[0.6rem] ${
                              video.status === "published"
                                ? "bg-green-500/15 text-green-400"
                                : "bg-yellow-500/15 text-yellow-400"
                            }`}
                          >
                            {video.status === "rendering" ? "⏳ Rendering..." : "✓ Published"}
                          </span>
                          <span className="text-white/25 text-[0.6rem]">{video.createdAt}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-white text-sm font-semibold">{video.views}</p>
                        {video.watchTime !== "—" && (
                          <p className="text-green-400 text-xs">{video.watchTime} retained</p>
                        )}
                      </div>

                      <button className="text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">
              {/* RetentionAI score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <h3 className="text-white text-sm font-semibold">RetentionAI™ Score</h3>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.88) }}
                        transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#A78BFA" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-bold text-2xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>88</span>
                      <span className="text-purple-300 text-xs">A+</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Hook Score", val: "94" },
                    { label: "Pacing", val: "87" },
                    { label: "Re-Hooks", val: "91" },
                    { label: "CTA Power", val: "78" },
                  ].map((m) => (
                    <div key={m.label} className="p-2 rounded-lg bg-white/4 text-center">
                      <p className="text-purple-300 font-bold text-sm">{m.val}</p>
                      <p className="text-white/35 text-[0.6rem]">{m.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Trending topics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-white/8 bg-white/3 p-5 flex-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <h3 className="text-white text-sm font-semibold">Trending Now</h3>
                  </div>
                  <span className="text-white/25 text-[0.6rem]">Updated 2h ago</span>
                </div>

                <div className="flex flex-col gap-2">
                  {trendingTopics.map((t, i) => (
                    <motion.div
                      key={t.topic}
                      whileHover={{ x: 3 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group border border-transparent hover:border-white/8"
                    >
                      <div
                        className="text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: t.heat >= 95 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.15)",
                          color: t.heat >= 95 ? "#F87171" : "#FCD34D",
                        }}
                      >
                        {t.heat}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs leading-snug mb-0.5 group-hover:text-white transition-colors">
                          {t.topic}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/25 text-[0.6rem]">{t.niche}</span>
                          <span className="text-green-400 text-[0.6rem]">{t.growth}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-0.5" />
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate("/create")}
                  className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                  Create Video from Trend →
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
