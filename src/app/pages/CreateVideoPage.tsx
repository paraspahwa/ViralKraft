import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { CinematicBackground } from "../components/CinematicBackground";
import { AppNavbar } from "../components/AppNavbar";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";
import {
  Sparkles, Brain, Mic2, Type, ChevronRight, ChevronLeft,
  Play, Wand2, Check, Loader2, TrendingUp, Flame,
  Volume2, Smile, Zap, Download, Share2, RotateCcw
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Topic & Script", icon: Type },
  { id: 2, label: "Voice & Avatar", icon: Mic2 },
  { id: 3, label: "Style & Captions", icon: Wand2 },
  { id: 4, label: "Generate", icon: Sparkles },
];

const trendTopics = [
  "AI taking over creative jobs",
  "Hidden fees in credit cards",
  "Sleep hacks billionaires use",
  "History's strangest coincidences",
  "Passive income you can start today",
];

const voices = [
  { id: "alex", name: "Alex", style: "Energetic", lang: "EN", color: "#A78BFA" },
  { id: "sarah", name: "Sarah", style: "Calm & Clear", lang: "EN", color: "#06B6D4" },
  { id: "marcus", name: "Marcus", style: "Deep & Bold", lang: "EN", color: "#EC4899" },
  { id: "priya", name: "Priya", style: "Friendly", lang: "EN", color: "#34D399" },
  { id: "raj", name: "Raj", style: "Professional", lang: "HI", color: "#F59E0B" },
  { id: "yuki", name: "Yuki", style: "Gentle", lang: "JA", color: "#A78BFA" },
];

const emotions = [
  { label: "Excited", emoji: "🤩" },
  { label: "Urgent", emoji: "⚡" },
  { label: "Calm", emoji: "😌" },
  { label: "Humorous", emoji: "😄" },
  { label: "Mysterious", emoji: "🎭" },
];

const captionStyles = [
  { id: "neon", name: "Neon Pop", preview: "WATCH THIS", color: "#A78BFA" },
  { id: "bold", name: "Bold Drop", preview: "Watch This", color: "#EC4899" },
  { id: "clean", name: "Clean White", preview: "Watch this", color: "#FFFFFF" },
  { id: "fire", name: "Fire Mode", preview: "WATCH THIS 🔥", color: "#F59E0B" },
];

const backgrounds = [
  { id: "citynight", name: "City Night", gradient: "linear-gradient(135deg, #0d0025, #001020)" },
  { id: "abstract", name: "Abstract Flow", gradient: "linear-gradient(135deg, #1a0035, #001a30)" },
  { id: "forest", name: "Mystic Forest", gradient: "linear-gradient(135deg, #001505, #0a1000)" },
  { id: "cosmic", name: "Cosmic", gradient: "linear-gradient(135deg, #05000f, #000520)" },
];

export function CreateVideoPage() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alex");
  const [selectedEmotion, setSelectedEmotion] = useState("Excited");
  const [selectedCaption, setSelectedCaption] = useState("neon");
  const [selectedBg, setSelectedBg] = useState("cosmic");
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [retentionScore, setRetentionScore] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!hasSupabaseBrowserConfig()) {
        if (mounted) {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
        navigate("/login?next=/create", { replace: true });
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (mounted) {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
        navigate("/login?next=/create", { replace: true });
        return;
      }

      const { data } = await supabase.auth.getSession();
      const authed = Boolean(data.session?.user?.id);

      if (!mounted) {
        return;
      }

      setIsAuthorized(authed);
      setIsCheckingAuth(false);

      if (!authed) {
        navigate("/login?next=/create", { replace: true });
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

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

  const generateScript = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setScript(
      `🎯 HOOK (0-3s):\n"You're losing $10,000 a year and you don't even know it."\n\n📖 BODY (3-45s):\nMost people think they're saving money — but hidden fees are silently draining their accounts. Credit cards, subscriptions, banking apps... they all do it.\n\nHere's what to look for: [1] Annual fees disguised as 'maintenance'. [2] Foreign transaction fees on every purchase. [3] Inactivity fees — yes, for NOT spending.\n\nI audited my own finances last month and found $847 in hidden fees I didn't even know I was paying.\n\n🔁 RE-HOOK (45s):\nBut here's the crazy part — you can get ALL of this money back. Here's exactly how...\n\n📢 CTA (55-60s):\nFollow for Part 2 where I show you the exact script to call your bank and get refunds instantly.`
    );
    setScriptGenerated(true);
    setGenerating(false);
  };

  const handleGenerate = async () => {
    setVideoGenerating(true);
    setVideoProgress(0);
    const intervals = [
      { target: 18, msg: "Analyzing script with RetentionAI™...", delay: 600 },
      { target: 35, msg: "Rendering 9:16 scenes...", delay: 800 },
      { target: 52, msg: "Synthesizing AI voice...", delay: 700 },
      { target: 71, msg: "Adding animated captions...", delay: 600 },
      { target: 88, msg: "Optimizing for TikTok algorithm...", delay: 700 },
      { target: 100, msg: "Finalizing your video...", delay: 500 },
    ];
    for (const step of intervals) {
      await new Promise((r) => setTimeout(r, step.delay));
      setVideoProgress(step.target);
    }
    await new Promise((r) => setTimeout(r, 600));
    setRetentionScore(Math.floor(Math.random() * 8) + 82); // 82-89
    setVideoGenerating(false);
    setVideoReady(true);
  };

  const progressLabels: { [key: number]: string } = {
    18: "Analyzing script with RetentionAI™...",
    35: "Rendering 9:16 scenes...",
    52: "Synthesizing AI voice...",
    71: "Adding animated captions...",
    88: "Optimizing for TikTok algorithm...",
    100: "Finalizing your video...",
  };

  const currentLabel = Object.entries(progressLabels)
    .filter(([k]) => parseInt(k) <= videoProgress)
    .pop()?.[1] ?? "Preparing...";

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <CinematicBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <AppNavbar />

        <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1
              className="text-white mb-1"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "1.7rem" }}
            >
              Create Viral Video ✨
            </h1>
            <p className="text-white/40 text-sm">Powered by RetentionAI™ — optimized for 2026 algorithms</p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                        : isDone
                        ? "bg-green-500/15 border border-green-500/25 text-green-400"
                        : "bg-white/4 border border-white/8 text-white/30"
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.id}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-6 h-px bg-white/10" />
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-5"
              >
                {/* Main input */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                    <label className="block text-white/60 text-xs mb-2 uppercase tracking-wide">
                      Video Topic / Idea
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Hidden fees banks charge you without telling you"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors"
                    />

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-white/25 text-xs">Try trending:</span>
                      {trendTopics.slice(0, 3).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTopic(t)}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/70 text-xs transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Script area */}
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white/60 text-xs uppercase tracking-wide">Script</label>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={generateScript}
                        disabled={!topic.trim() || generating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-all"
                        style={{
                          background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))",
                          border: "1px solid rgba(139,92,246,0.3)",
                          color: "#C4B5FD",
                        }}
                      >
                        {generating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Brain className="w-3 h-3" />
                        )}
                        {generating ? "Generating..." : "AI Generate Script"}
                      </motion.button>
                    </div>
                    <textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Write your script here, or click 'AI Generate Script' above to generate one from your topic..."
                      rows={12}
                      className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white/70 text-xs leading-relaxed placeholder-white/20 outline-none focus:border-purple-500/40 transition-colors resize-none"
                    />

                    {scriptGenerated && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20"
                      >
                        <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <p className="text-purple-300 text-xs">
                          RetentionAI™ optimized your script — hook at 0-3s, re-engagement at 45s, CTA at 55s
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Trending topics sidebar */}
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <h3 className="text-white text-sm font-semibold">Trending Topics</h3>
                  </div>
                  <p className="text-white/30 text-xs mb-4">Updated 2h ago • Click to use</p>
                  <div className="flex flex-col gap-2">
                    {trendTopics.map((t, i) => (
                      <motion.button
                        key={t}
                        whileHover={{ x: 3 }}
                        onClick={() => setTopic(t)}
                        className="flex items-start gap-2 p-3 rounded-xl text-left hover:bg-white/5 border border-transparent hover:border-white/8 transition-all"
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[0.6rem] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D" }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-white/55 text-xs leading-snug hover:text-white">{t}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Nav */}
                <div className="lg:col-span-3 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    disabled={!script.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                      boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                    }}
                  >
                    Next: Voice & Avatar
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <h3 className="text-white text-sm font-semibold mb-4">Choose AI Voice</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {voices.map((v) => (
                      <motion.button
                        key={v.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedVoice(v.id)}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          selectedVoice === v.id
                            ? "border-purple-500/50 bg-purple-500/12"
                            : "border-white/8 hover:border-white/15 bg-white/2"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}80)` }}
                          >
                            {v.name[0]}
                          </div>
                          <span className="text-white/25 text-[0.6rem] border border-white/10 px-1.5 py-0.5 rounded">{v.lang}</span>
                        </div>
                        <p className="text-white text-xs font-semibold">{v.name}</p>
                        <p className="text-white/40 text-[0.65rem]">{v.style}</p>
                        {selectedVoice === v.id && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                <motion.div
                                  key={i}
                                  className="w-0.5 rounded-full"
                                  style={{ height: `${h * 2}px`, background: v.color }}
                                  animate={{ scaleY: [1, 1.5, 0.8, 1.2, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <h3 className="text-white text-sm font-semibold mb-4">Voice Emotion Control</h3>
                  <p className="text-white/40 text-xs mb-3">Select the emotional tone for your AI voice — not just text, but feeling.</p>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((e) => (
                      <motion.button
                        key={e.label}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedEmotion(e.label)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                          selectedEmotion === e.label
                            ? "border-purple-500/40 bg-purple-500/15 text-purple-200"
                            : "border-white/8 bg-white/3 text-white/50 hover:border-white/15"
                        }`}
                      >
                        <span>{e.emoji}</span>
                        {e.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/50 border border-white/10 text-sm hover:border-white/20 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}
                  >
                    Next: Style & Captions
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <h3 className="text-white text-sm font-semibold mb-4">Caption Style</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {captionStyles.map((c) => (
                      <motion.button
                        key={c.id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedCaption(c.id)}
                        className={`p-4 rounded-xl border transition-all text-center ${
                          selectedCaption === c.id
                            ? "border-purple-500/40 bg-purple-500/10"
                            : "border-white/8 bg-white/2 hover:border-white/15"
                        }`}
                      >
                        <p
                          className="text-sm font-bold mb-2"
                          style={{ color: c.color, textShadow: `0 0 10px ${c.color}60` }}
                        >
                          {c.preview}
                        </p>
                        <p className="text-white/40 text-xs">{c.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <h3 className="text-white text-sm font-semibold mb-4">Background Style</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {backgrounds.map((b) => (
                      <motion.button
                        key={b.id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedBg(b.id)}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          selectedBg === b.id
                            ? "border-purple-500/50 ring-1 ring-purple-500/30"
                            : "border-white/8 hover:border-white/20"
                        }`}
                      >
                        <div
                          className="h-16 w-full"
                          style={{ background: b.gradient }}
                        />
                        <div className="px-2 py-1.5 bg-white/5">
                          <p className="text-white/60 text-xs text-center">{b.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/50 border border-white/10 text-sm hover:border-white/20 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Video
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Generate */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                {!videoGenerating && !videoReady && (
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))" }}
                    >
                      <Sparkles className="w-9 h-9 text-purple-400" />
                    </motion.div>
                    <h3
                      className="text-white mb-2"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}
                    >
                      Ready to Generate
                    </h3>
                    <p className="text-white/45 text-sm mb-6">
                      Your video will be analyzed by RetentionAI™, optimized for maximum watch time, and rendered in 9:16.
                    </p>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3 mb-7 text-left">
                      {[
                        { label: "Topic", value: topic || "AI tools changing jobs" },
                        { label: "Voice", value: `${voices.find((v) => v.id === selectedVoice)?.name} — ${selectedEmotion}` },
                        { label: "Caption Style", value: captionStyles.find((c) => c.id === selectedCaption)?.name || "" },
                        { label: "Background", value: backgrounds.find((b) => b.id === selectedBg)?.name || "" },
                      ].map((s) => (
                        <div key={s.label} className="p-3 rounded-xl bg-white/4 border border-white/6">
                          <p className="text-white/35 text-xs mb-0.5">{s.label}</p>
                          <p className="text-white text-xs font-medium truncate">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGenerate}
                      className="w-full py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                        boxShadow: "0 4px 30px rgba(139,92,246,0.35)",
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      Generate with RetentionAI™
                    </motion.button>
                  </div>
                )}

                {/* Generating */}
                {videoGenerating && (
                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                      style={{ border: "2px solid transparent", borderTopColor: "#A78BFA", borderRightColor: "#06B6D4" }}
                    >
                      <Brain className="w-7 h-7 text-purple-400" />
                    </motion.div>
                    <h3 className="text-white font-semibold mb-1">Generating Your Video...</h3>
                    <p className="text-white/40 text-xs mb-6">{currentLabel}</p>

                    <div className="w-full bg-white/8 rounded-full h-2 mb-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }}
                        animate={{ width: `${videoProgress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <p className="text-purple-300 text-xs">{videoProgress}% complete</p>
                  </div>
                )}

                {/* Video ready */}
                {videoReady && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="rounded-2xl border border-green-500/25 bg-green-500/5 p-6 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(52,211,153,0.15)" }}
                      >
                        <Check className="w-7 h-7 text-green-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Your Video is Ready! 🎉</h3>
                      <p className="text-white/40 text-xs">Optimized by RetentionAI™ — ready for TikTok, Reels & Shorts</p>
                    </div>

                    {/* Mockup phone */}
                    <div className="flex justify-center">
                      <div
                        className="relative w-44 rounded-[2rem] border-2 overflow-hidden"
                        style={{
                          borderColor: "rgba(139,92,246,0.4)",
                          aspectRatio: "9/16",
                          maxHeight: "380px",
                          background: backgrounds.find((b) => b.id === selectedBg)?.gradient,
                          boxShadow: "0 0 50px rgba(139,92,246,0.25)",
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-center"
                          >
                            <p
                              className="text-white font-black text-sm mb-1"
                              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
                            >
                              {captionStyles.find((c) => c.id === selectedCaption)?.preview}
                            </p>
                          </motion.div>
                          <div className="mt-4 w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 flex flex-col gap-1 items-end pr-2">
                          {["❤️ 24K", "💬 891", "🔁 1.2K"].map((s) => (
                            <span key={s} className="text-white text-[0.55rem] font-bold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RetentionAI score */}
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/8 p-4 flex items-center gap-4">
                      <Brain className="w-8 h-8 text-purple-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white text-xs font-semibold mb-0.5">RetentionAI™ Score: {retentionScore}/100</p>
                        <p className="text-white/40 text-xs">Hook strength: Excellent • Pacing: Optimized • CTA: Strong</p>
                      </div>
                      <div
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          background: "linear-gradient(135deg, #A78BFA, #06B6D4)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {retentionScore >= 85 ? "A+" : retentionScore >= 80 ? "A" : "B+"}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 bg-white/3 text-white/60 hover:text-white transition-all text-xs"
                      >
                        <Download className="w-4 h-4" />
                        Download 4K
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 bg-white/3 text-white/60 hover:text-white transition-all text-xs"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Now
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={() => { setVideoReady(false); setVideoProgress(0); setStep(1); setScript(""); setScriptGenerated(false); }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 bg-white/3 text-white/60 hover:text-white transition-all text-xs"
                      >
                        <RotateCcw className="w-4 h-4" />
                        New Video
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => navigate("/dashboard")}
                      className="w-full py-2.5 rounded-xl text-sm text-white/60 border border-white/8 hover:border-white/15 transition-all"
                    >
                      ← Back to Dashboard
                    </motion.button>
                  </motion.div>
                )}

                {!videoGenerating && !videoReady && (
                  <div className="flex justify-start mt-4">
                    <button
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/50 border border-white/10 text-sm hover:border-white/20 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
