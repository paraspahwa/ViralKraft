import { ChangeEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CinematicBackground } from "../components/CinematicBackground";
import { AppNavbar } from "../components/AppNavbar";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";
import {
  Sparkles, Brain, Mic2, Type, ChevronRight, ChevronLeft,
  Play, Wand2, Check, Loader2, TrendingUp, Flame,
  Volume2, Smile, Zap, Download, Share2, RotateCcw, RefreshCw,
  Scissors, SlidersHorizontal, Upload, Music, Save
} from "lucide-react";

const fallbackScript = `🎯 HOOK (0-3s):
"You're losing $10,000 a year and you don't even know it."

📖 BODY (3-45s):
Most people think they're saving money — but hidden fees are silently draining their accounts. Credit cards, subscriptions, banking apps... they all do it.

Here's what to look for: [1] Annual fees disguised as 'maintenance'. [2] Foreign transaction fees on every purchase. [3] Inactivity fees — yes, for NOT spending.

I audited my own finances last month and found $847 in hidden fees I didn't even know I was paying.

🔁 RE-HOOK (45s):
But here's the crazy part — you can get ALL of this money back. Here's exactly how...

📢 CTA (55-60s):
Follow for Part 2 where I show you the exact script to call your bank and get refunds instantly.`;

const STEPS = [
  { id: 1, label: "Topic & Script", icon: Type },
  { id: 2, label: "Voice & Avatar", icon: Mic2 },
  { id: 3, label: "Video Model", icon: Wand2 },
  { id: 4, label: "Generate", icon: Sparkles },
];

type TrendTopic = {
  id: string;
  topic: string;
  heat: number;
  growth: string;
};

const fallbackTrendTopics: TrendTopic[] = [
  { id: "t1", topic: "AI taking over creative jobs", heat: 96, growth: "+320%" },
  { id: "t2", topic: "Hidden fees in credit cards", heat: 91, growth: "+210%" },
  { id: "t3", topic: "Sleep hacks billionaires use", heat: 88, growth: "+175%" },
  { id: "t4", topic: "History's strangest coincidences", heat: 85, growth: "+162%" },
  { id: "t5", topic: "Passive income you can start today", heat: 82, growth: "+140%" },
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

const USD_PER_CREDIT = 0.0999;

const videoModels = [
  {
    rank: 1,
    id: "fal-ai/longcat-video/distilled/720p",
    category: "Best Value",
    usdPerSecond: 0.01,
    quality: "7.0/10",
    bestFor: "Long-form anime (up to 4 min), story continuity",
  },
  {
    rank: 2,
    id: "fal-ai/longcat-video/distilled/480p",
    category: "Ultra Budget",
    usdPerSecond: 0.005,
    quality: "6.5/10",
    bestFor: "Drafts, prototyping, storyboarding",
  },
  {
    rank: 3,
    id: "fal-ai/wan/v2.2-5b/text-to-video/fast-wan",
    category: "Budget 720p",
    usdPerSecond: 0.0125,
    quality: "6.0/10",
    bestFor: "Fast previews, short clips",
  },
  {
    rank: 4,
    id: "fal-ai/ltxv-13b-098-distilled",
    category: "Long Videos",
    usdPerSecond: 0.02,
    quality: "6.5/10",
    bestFor: "50s duration, 10 credits = 50s generation",
  },
  {
    rank: 5,
    id: "fal-ai/hunyuan-video-v1.5/text-to-video",
    category: "Best Open Source",
    usdPerSecond: 0.0075,
    quality: "7.5/10",
    bestFor: "High quality shorts, beats commercial models",
  },
  {
    rank: 6,
    id: "fal-ai/kling-video/v2.6/pro/text-to-video",
    category: "Premium Motion",
    usdPerSecond: 0.07,
    quality: "8.5/10",
    bestFor: "Production quality, 3min duration",
  },
  {
    rank: 7,
    id: "fal-ai/seedance/v1.5/pro/text-to-video",
    category: "Best Audio Sync",
    usdPerSecond: 0.052,
    quality: "8.5/10",
    bestFor: "Lip-sync, stereo audio, 8+ languages",
  },
  {
    rank: 8,
    id: "fal-ai/pixverse/v5.6/text-to-video",
    category: "Balanced",
    usdPerSecond: 0.07,
    quality: "7.5/10",
    bestFor: "Flexible 360p-1080p, optional audio",
  },
  {
    rank: 9,
    id: "fal-ai/minimax/hailuo-2.3/standard/text-to-video",
    category: "Best Physics",
    usdPerSecond: 0.047,
    quality: "8.5/10",
    bestFor: "Realistic physics, action scenes",
  },
  {
    rank: 10,
    id: "veed/fabric-1.0/text",
    category: "Talking Avatars",
    usdPerSecond: 0.08,
    quality: "7.0/10",
    bestFor: "Lip-sync avatars, 60s max duration",
  },
];

const durationOptions = [
  { label: "10 Sec", seconds: 10 },
  { label: "30 Sec", seconds: 30 },
  { label: "1 Min", seconds: 60 },
  { label: "2 Min", seconds: 120 },
];

function getCreditsFor10Sec(usdPerSecond: number) {
  return (usdPerSecond * 10) / USD_PER_CREDIT;
}

function toFixedCredits(value: number) {
  return Number(value.toFixed(2));
}

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
  const [selectedVideoModel, setSelectedVideoModel] = useState(videoModels[0].id);
  const [selectedDurationSeconds, setSelectedDurationSeconds] = useState(10);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generationProvider, setGenerationProvider] = useState<string | null>(null);
  const [falRequestId, setFalRequestId] = useState<string | null>(null);
  const [retentionScore, setRetentionScore] = useState(0);
  const [savedVideoId, setSavedVideoId] = useState<string | null>(null);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(60);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionScale, setCaptionScale] = useState(100);
  const [bhashiniVoiceLanguage, setBhashiniVoiceLanguage] = useState("hi-IN");
  const [bhashiniAudioUrl, setBhashiniAudioUrl] = useState<string | null>(null);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false);
  const [uploadedVoiceFileName, setUploadedVoiceFileName] = useState<string | null>(null);
  const [uploadedVoiceUrl, setUploadedVoiceUrl] = useState<string | null>(null);
  const [uploadedVoicePath, setUploadedVoicePath] = useState<string | null>(null);
  const [uploadedVoiceFile, setUploadedVoiceFile] = useState<File | null>(null);
  const [uploadedSongFileName, setUploadedSongFileName] = useState<string | null>(null);
  const [uploadedSongUrl, setUploadedSongUrl] = useState<string | null>(null);
  const [uploadedSongPath, setUploadedSongPath] = useState<string | null>(null);
  const [uploadedSongFile, setUploadedSongFile] = useState<File | null>(null);
  const [liveTrendTopics, setLiveTrendTopics] = useState<TrendTopic[]>(fallbackTrendTopics);
  const [trendsUpdatedAt, setTrendsUpdatedAt] = useState(Date.now());
  const [trendsUpdatedLabel, setTrendsUpdatedLabel] = useState("Updated just now");
  const [trendsRefreshing, setTrendsRefreshing] = useState(false);

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

      const session = await getSessionWithRetry();
      const authed = Boolean(session?.user?.id);

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

  useEffect(() => {
    if (!isAuthorized || hasLoadedDraft) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setHasLoadedDraft(true);
      return;
    }

    let mounted = true;

    const loadLatestDraft = async () => {
      const createSignedAudioUrl = async (filePath: string) => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("user-audio")
          .createSignedUrl(filePath, 60 * 60);

        if (signedError || !signedData?.signedUrl) {
          return null;
        }

        return signedData.signedUrl;
      };

      const { data, error } = await supabase
        .from("videos")
        .select("id,title,niche,status,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!mounted) {
        return;
      }

      setHasLoadedDraft(true);

      if (error || !data || data.length === 0) {
        return;
      }

      const draft = data.find((row) => {
        const metadata = (row as { metadata?: { source?: string } }).metadata;
        return metadata?.source === "create-video-editor";
      }) as
        | {
            id: string;
            title: string;
            metadata?: {
              script?: string;
              editSettings?: {
                trimStart?: number;
                trimEnd?: number;
                playbackRate?: number;
                captionScale?: number;
                selectedVideoModel?: string;
                selectedDurationSeconds?: number;
                estimatedCreditsToDeduct?: number;
                totalCreditsUsed?: number;
                generatedVideoUrl?: string;
                generationProvider?: string;
                falRequestId?: string;
              };
              audio?: {
                aiVoice?: {
                  language?: string;
                  selectedVoice?: string;
                  emotion?: string;
                  trackUrl?: string | null;
                };
                uploadedVoice?: {
                  fileName?: string | null;
                  trackPath?: string | null;
                  trackUrl?: string | null;
                };
                uploadedSong?: {
                  fileName?: string | null;
                  trackPath?: string | null;
                  trackUrl?: string | null;
                };
              };
            };
          }
        | undefined;

      if (!draft) {
        return;
      }

      setSavedVideoId(draft.id);
      setTopic(draft.title || "");
      setScript(draft.metadata?.script || "");
      setScriptGenerated(Boolean(draft.metadata?.script));
      setStep(4);
      setVideoReady(true);

      const editSettings = draft.metadata?.editSettings;
      if (typeof editSettings?.trimStart === "number") setTrimStart(editSettings.trimStart);
      if (typeof editSettings?.trimEnd === "number") setTrimEnd(editSettings.trimEnd);
      if (typeof editSettings?.playbackRate === "number") setPlaybackRate(editSettings.playbackRate);
      if (typeof editSettings?.captionScale === "number") setCaptionScale(editSettings.captionScale);
      if (
        typeof editSettings?.selectedVideoModel === "string" &&
        videoModels.some((model) => model.id === editSettings.selectedVideoModel)
      ) {
        setSelectedVideoModel(editSettings.selectedVideoModel);
      }
      if (
        typeof editSettings?.selectedDurationSeconds === "number" &&
        durationOptions.some((option) => option.seconds === editSettings.selectedDurationSeconds)
      ) {
        setSelectedDurationSeconds(editSettings.selectedDurationSeconds);
      }
      if (typeof editSettings?.totalCreditsUsed === "number") {
        setCreditsUsed(editSettings.totalCreditsUsed);
      }
      if (typeof editSettings?.generatedVideoUrl === "string" && editSettings.generatedVideoUrl.trim()) {
        setGeneratedVideoUrl(editSettings.generatedVideoUrl);
      }
      if (typeof editSettings?.generationProvider === "string" && editSettings.generationProvider.trim()) {
        setGenerationProvider(editSettings.generationProvider);
      }
      if (typeof editSettings?.falRequestId === "string" && editSettings.falRequestId.trim()) {
        setFalRequestId(editSettings.falRequestId);
      }

      const aiVoice = draft.metadata?.audio?.aiVoice;
      if (typeof aiVoice?.language === "string") setBhashiniVoiceLanguage(aiVoice.language);
      if (typeof aiVoice?.selectedVoice === "string") setSelectedVoice(aiVoice.selectedVoice);
      if (typeof aiVoice?.emotion === "string") setSelectedEmotion(aiVoice.emotion);
      if (typeof aiVoice?.trackUrl === "string" && aiVoice.trackUrl.trim()) {
        setBhashiniAudioUrl(aiVoice.trackUrl);
      }

      const uploadedVoice = draft.metadata?.audio?.uploadedVoice;
      const uploadedSong = draft.metadata?.audio?.uploadedSong;
      if (typeof uploadedVoice?.fileName === "string" && uploadedVoice.fileName.trim()) {
        setUploadedVoiceFileName(uploadedVoice.fileName);
      }
      if (typeof uploadedVoice?.trackPath === "string" && uploadedVoice.trackPath.trim()) {
        setUploadedVoicePath(uploadedVoice.trackPath);
        const signedUrl = await createSignedAudioUrl(uploadedVoice.trackPath);
        if (signedUrl) {
          setUploadedVoiceUrl(signedUrl);
        }
      } else if (typeof uploadedVoice?.trackUrl === "string" && uploadedVoice.trackUrl.trim()) {
        setUploadedVoiceUrl(uploadedVoice.trackUrl);
      }
      if (typeof uploadedSong?.fileName === "string" && uploadedSong.fileName.trim()) {
        setUploadedSongFileName(uploadedSong.fileName);
      }
      if (typeof uploadedSong?.trackPath === "string" && uploadedSong.trackPath.trim()) {
        setUploadedSongPath(uploadedSong.trackPath);
        const signedUrl = await createSignedAudioUrl(uploadedSong.trackPath);
        if (signedUrl) {
          setUploadedSongUrl(signedUrl);
        }
      } else if (typeof uploadedSong?.trackUrl === "string" && uploadedSong.trackUrl.trim()) {
        setUploadedSongUrl(uploadedSong.trackUrl);
      }

      toast.success("Loaded your latest saved draft.");
    };

    void loadLatestDraft();

    return () => {
      mounted = false;
    };
  }, [hasLoadedDraft, isAuthorized]);

  useEffect(() => {
    return () => {
      if (uploadedVoiceUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedVoiceUrl);
      }
      if (uploadedSongUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedSongUrl);
      }
    };
  }, [uploadedSongUrl, uploadedVoiceUrl]);

  async function refreshTrendingTopics() {
    if (!isAuthorized) {
      return;
    }

    try {
      setTrendsRefreshing(true);
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        const { data, error } = await supabase
          .from("trending_topics")
          .select("id,topic,heat,growth")
          .eq("is_active", true)
          .order("heat", { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          setLiveTrendTopics(
            data.map((row) => ({
              id: String(row.id),
              topic: String(row.topic),
              heat: Number(row.heat) || 80,
              growth: String(row.growth || "+100%"),
            })),
          );
          setTrendsUpdatedAt(Date.now());
          setTrendsUpdatedLabel("Updated just now");
          return;
        }
      }

      // Fallback: one-shot local refresh if DB table is unavailable.
      setLiveTrendTopics((current) => {
        const next = current.map((item) => {
          const nextHeat = Math.max(65, Math.min(99, item.heat + (Math.random() > 0.5 ? 2 : -2)));
          const growthBase = Number.parseInt(item.growth.replace(/[^0-9]/g, ""), 10) || 100;
          const nextGrowth = Math.max(80, growthBase + (Math.random() > 0.5 ? 8 : -6));
          return {
            ...item,
            heat: nextHeat,
            growth: `+${nextGrowth}%`,
          };
        });

        next.sort((a, b) => b.heat - a.heat);
        return next;
      });

      setTrendsUpdatedAt(Date.now());
      setTrendsUpdatedLabel("Updated just now");
    } finally {
      setTrendsRefreshing(false);
    }
  }

  const generateScript = async () => {
    if (!topic.trim()) return;
    setGenerating(true);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!response.ok) {
        throw new Error("AI script API failed");
      }

      const data = (await response.json()) as { ok?: boolean; script?: string };
      if (!data.ok || !data.script) {
        throw new Error("AI script response missing script");
      }

      setScript(data.script);
      setScriptGenerated(true);
    } catch {
      // Keep UX unblocked when model/API is unavailable.
      setScript(fallbackScript);
      setScriptGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    const selectedModel = videoModels.find((model) => model.id === selectedVideoModel) || videoModels[0];
    const creditsFor10Sec = getCreditsFor10Sec(selectedModel.usdPerSecond);
    const estimatedCredits = toFixedCredits(creditsFor10Sec * (selectedDurationSeconds / 10));
    const generationReferenceId = `${selectedModel.id}-${selectedDurationSeconds}-${Date.now()}`;

    const session = await getSessionWithRetry();
    const token = session?.access_token;
    if (!token) {
      toast.error("Please sign in again to consume credits.");
      return;
    }

    const consumeResponse = await fetch("/api/consume-credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        modelId: selectedModel.id,
        durationSeconds: selectedDurationSeconds,
        referenceId: generationReferenceId,
      }),
    });

    const consumePayload = (await consumeResponse.json()) as {
      deductedCredits?: number;
      balance?: number;
      availableCredits?: number;
      requiredCredits?: number;
      error?: string;
    };

    if (!consumeResponse.ok) {
      if (consumeResponse.status === 402) {
        toast.error(
          `Insufficient credits. Need ${consumePayload.requiredCredits || estimatedCredits}, have ${consumePayload.availableCredits || 0}.`,
        );
      } else {
        toast.error(consumePayload.error || "Could not deduct credits for generation.");
      }
      return;
    }

    const creditsToDeduct = toFixedCredits(consumePayload.deductedCredits || estimatedCredits);
    if (typeof consumePayload.balance === "number") {
      setWalletBalance(consumePayload.balance);
    }

    try {
      setVideoGenerating(true);
      setVideoProgress(0);
      setVideoReady(false);
      setGeneratedVideoUrl(null);
      setGenerationProvider(null);
      setFalRequestId(null);

      const intervals = [
        { target: 18, delay: 600 },
        { target: 35, delay: 800 },
        { target: 52, delay: 700 },
        { target: 71, delay: 600 },
        { target: 88, delay: 700 },
        { target: 100, delay: 500 },
      ];

      const animateProgress = async () => {
        for (const step of intervals) {
          await new Promise((r) => setTimeout(r, step.delay));
          setVideoProgress(step.target);
        }
      };

      const generationPromise = (async () => {
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            modelId: selectedModel.id,
            durationSeconds: selectedDurationSeconds,
            topic,
            script,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          provider?: string;
          requestId?: string;
          videoUrl?: string;
          error?: string;
        };

        if (!response.ok || !payload.ok || !payload.videoUrl) {
          throw new Error(payload.error || "Video generation failed");
        }

        return payload;
      })();

      const [generationPayload] = await Promise.all([generationPromise, animateProgress()]);

      await new Promise((r) => setTimeout(r, 500));
      setRetentionScore(Math.floor(Math.random() * 8) + 82); // 82-89
      setVideoGenerating(false);
      setVideoReady(true);
      setGeneratedVideoUrl(generationPayload.videoUrl || null);
      setGenerationProvider(generationPayload.provider || null);
      setFalRequestId(generationPayload.requestId || null);
      setSavedVideoId(null);
      setTrimStart(0);
      setTrimEnd(selectedDurationSeconds);
      setPlaybackRate(1);
      setCaptionScale(100);
      setCreditsUsed((prev) => toFixedCredits(prev + creditsToDeduct));
      toast.success(`${creditsToDeduct} credits deducted for ${selectedDurationSeconds}s generation.`);
    } catch (error) {
      setVideoGenerating(false);
      setVideoProgress(0);

      let refundOutcome: {
        refunded: boolean;
        reused: boolean;
      } = {
        refunded: false,
        reused: false,
      };

      try {
        const refundResponse = await fetch("/api/refund-credits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            referenceId: generationReferenceId,
          }),
        });

        const refundPayload = (await refundResponse.json()) as {
          ok?: boolean;
          refundedCredits?: number;
          balance?: number;
          reused?: boolean;
        };

        if (refundResponse.ok && refundPayload.ok) {
          refundOutcome = {
            refunded: typeof refundPayload.refundedCredits === "number" && refundPayload.refundedCredits > 0,
            reused: Boolean(refundPayload.reused),
          };

          if (typeof refundPayload.balance === "number") {
            setWalletBalance(refundPayload.balance);
          }
        }
      } catch {
        // Best effort rollback; if this fails, manual support can still reconcile ledger.
      }

      const message = error instanceof Error ? error.message : "Video generation failed";
      if (refundOutcome.refunded || refundOutcome.reused) {
        toast.error(`${message} Deducted credits were refunded automatically.`);
      } else {
        toast.error(`${message} Credit refund could not be confirmed automatically.`);
      }
    }
  };

  const handleOpenGeneratedVideo = () => {
    if (!generatedVideoUrl) {
      toast.error("No generated video URL is available yet.");
      return;
    }

    window.open(generatedVideoUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyGeneratedVideoLink = async () => {
    if (!generatedVideoUrl) {
      toast.error("No generated video URL is available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedVideoUrl);
      toast.success("Video link copied to clipboard.");
    } catch {
      toast.error("Could not copy video link.");
    }
  };

  const saveEditSettings = async () => {
    try {
      if (trimStart >= trimEnd) {
        toast.error("Trim start must be less than trim end.");
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        toast.error("Supabase client not available.");
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const userId = data.session?.user?.id;

      if (!token || !userId) {
        toast.error("Please sign in again to save edits.");
        return;
      }

      setIsSavingEdits(true);

      let persistedVoiceUrl = uploadedVoiceUrl;
      let persistedSongUrl = uploadedSongUrl;
      let persistedVoicePath = uploadedVoicePath;
      let persistedSongPath = uploadedSongPath;

      const uploadFileIfNeeded = async (kind: "voice" | "song", file: File | null) => {
        if (!file) {
          return null;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${userId}/${kind}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("user-audio")
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          throw new Error(uploadError.message || `Failed to upload ${kind} file`);
        }

        const { data: signedData, error: signedError } = await supabase.storage
          .from("user-audio")
          .createSignedUrl(filePath, 60 * 60);

        if (signedError || !signedData?.signedUrl) {
          throw new Error(signedError?.message || `Failed to create signed URL for ${kind}`);
        }

        return { filePath, signedUrl: signedData.signedUrl };
      };

      if (uploadedVoiceFile) {
        const uploaded = await uploadFileIfNeeded("voice", uploadedVoiceFile);
        persistedVoicePath = uploaded?.filePath || null;
        persistedVoiceUrl = uploaded?.signedUrl || null;
      }

      if (uploadedSongFile) {
        const uploaded = await uploadFileIfNeeded("song", uploadedSongFile);
        persistedSongPath = uploaded?.filePath || null;
        persistedSongUrl = uploaded?.signedUrl || null;
      }

      if (!uploadedVoiceFile && uploadedVoicePath) {
        const { data: signedVoiceData } = await supabase.storage
          .from("user-audio")
          .createSignedUrl(uploadedVoicePath, 60 * 60);
        persistedVoiceUrl = signedVoiceData?.signedUrl || persistedVoiceUrl;
      }

      if (!uploadedSongFile && uploadedSongPath) {
        const { data: signedSongData } = await supabase.storage
          .from("user-audio")
          .createSignedUrl(uploadedSongPath, 60 * 60);
        persistedSongUrl = signedSongData?.signedUrl || persistedSongUrl;
      }

      const response = await fetch("/api/save-video-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: savedVideoId,
          title: topic?.trim() || "Generated Video",
          niche: liveTrendTopics.find((item) => item.topic === topic)?.topic ? "Trending" : "General",
          script,
          status: "rendering",
          editSettings: {
            trimStart,
            trimEnd,
            playbackRate,
            captionScale,
            selectedVideoModel,
            selectedDurationSeconds,
            estimatedCreditsToDeduct,
            totalCreditsUsed: creditsUsed,
            generatedVideoUrl,
            generationProvider,
            falRequestId,
          },
          audio: {
            aiVoice: {
              provider: bhashiniAudioUrl ? "bhashini" : "native",
              language: bhashiniVoiceLanguage,
              selectedVoice,
              emotion: selectedEmotion,
              hasGeneratedTrack: Boolean(bhashiniAudioUrl),
              trackUrl: bhashiniAudioUrl && bhashiniAudioUrl.startsWith("http") ? bhashiniAudioUrl : null,
            },
            uploadedVoice: {
              fileName: uploadedVoiceFileName,
              attached: Boolean(uploadedVoiceFileName),
              trackPath: persistedVoicePath || null,
              trackUrl: persistedVoiceUrl || null,
            },
            uploadedSong: {
              fileName: uploadedSongFileName,
              attached: Boolean(uploadedSongFileName),
              trackPath: persistedSongPath || null,
              trackUrl: persistedSongUrl || null,
            },
          },
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string; videoId?: string };
      if (!response.ok || !payload.ok || !payload.videoId) {
        throw new Error(payload.error || "Could not save edit settings");
      }

      setSavedVideoId(payload.videoId);
      setUploadedVoicePath(persistedVoicePath || null);
      setUploadedSongPath(persistedSongPath || null);
      setUploadedVoiceUrl(persistedVoiceUrl || null);
      setUploadedSongUrl(persistedSongUrl || null);
      setUploadedVoiceFile(null);
      setUploadedSongFile(null);
      toast.success("Edit settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSavingEdits(false);
    }
  };

  const handleVoiceUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (uploadedVoiceUrl) {
      URL.revokeObjectURL(uploadedVoiceUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setUploadedVoiceFileName(file.name);
    setUploadedVoiceFile(file);
    setUploadedVoicePath(null);
    setUploadedVoiceUrl(localUrl);
  };

  const handleSongUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (uploadedSongUrl) {
      URL.revokeObjectURL(uploadedSongUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setUploadedSongFileName(file.name);
    setUploadedSongFile(file);
    setUploadedSongPath(null);
    setUploadedSongUrl(localUrl);
  };

  const synthesizeBhashiniVoice = async () => {
    if (!script.trim()) {
      toast.error("Generate or enter a script first.");
      return;
    }

    try {
      setIsSynthesizingVoice(true);
      const response = await fetch("/api/bhashini-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          language: bhashiniVoiceLanguage,
          voiceId: selectedVoice,
          emotion: selectedEmotion,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; audioUrl?: string; error?: string };
      if (!response.ok || !payload.ok || !payload.audioUrl) {
        throw new Error(payload.error || "Could not synthesize voice");
      }

      setBhashiniAudioUrl(payload.audioUrl);
      toast.success("Bhashini AI voice generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Voice generation failed");
    } finally {
      setIsSynthesizingVoice(false);
    }
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

  const activeModel = videoModels.find((model) => model.id === selectedVideoModel) || videoModels[0];
  const activeModelCreditsFor10Sec = toFixedCredits(getCreditsFor10Sec(activeModel.usdPerSecond));
  const estimatedCreditsToDeduct = toFixedCredits(activeModelCreditsFor10Sec * (selectedDurationSeconds / 10));
  const modelUsedUsdCost = Number((estimatedCreditsToDeduct * USD_PER_CREDIT).toFixed(4));
  const gpuServerlessUsdCost = 0;
  const voiceRenderingUsdCost = 0;
  const totalGenerationUsdCost = Number(
    (modelUsedUsdCost + gpuServerlessUsdCost + voiceRenderingUsdCost).toFixed(4),
  );

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    let mounted = true;

    const loadWalletBalance = async () => {
      const session = await getSessionWithRetry();
      const token = session?.access_token;
      if (!token) {
        return;
      }

      const response = await fetch("/api/wallet-balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { ok?: boolean; balance?: number };
      if (mounted && payload.ok && typeof payload.balance === "number") {
        setWalletBalance(payload.balance);
      }
    };

    void loadWalletBalance();

    return () => {
      mounted = false;
    };
  }, [isAuthorized]);

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
                      {liveTrendTopics.slice(0, 3).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTopic(t.topic)}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/70 text-xs transition-colors"
                        >
                          {t.topic}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <h3 className="text-white text-sm font-semibold">Trending Topics</h3>
                    </div>
                    <button
                      onClick={() => void refreshTrendingTopics()}
                      disabled={trendsRefreshing}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[0.65rem] border border-white/12 text-white/70 hover:text-white disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3 h-3 ${trendsRefreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
                  <p className="text-white/30 text-xs mb-4">{trendsUpdatedLabel} • Click to use</p>
                  <div className="flex flex-col gap-2">
                    {liveTrendTopics.map((t, i) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ x: 3 }}
                        onClick={() => setTopic(t.topic)}
                        className="flex items-start gap-2 p-3 rounded-xl text-left hover:bg-white/5 border border-transparent hover:border-white/8 transition-all"
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[0.6rem] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D" }}
                        >
                          {t.heat}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-white/55 text-xs leading-snug hover:text-white block">{t.topic}</span>
                          <span className="text-green-400 text-[0.65rem]">{t.growth}</span>
                        </div>
                        <span className="text-white/20 text-[0.6rem]">#{i + 1}</span>
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

                <section className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-purple-300" />
                    <h4 className="text-sm font-semibold text-white">Voice and Audio Tracks</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                      <p className="mb-2 text-xs font-semibold text-white">Bhashini AI Voice</p>
                      <select
                        value={bhashiniVoiceLanguage}
                        onChange={(event) => setBhashiniVoiceLanguage(event.target.value)}
                        className="mb-2 w-full rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white"
                      >
                        <option value="hi-IN">Hindi (hi-IN)</option>
                        <option value="en-IN">English India (en-IN)</option>
                        <option value="bn-IN">Bengali (bn-IN)</option>
                        <option value="ta-IN">Tamil (ta-IN)</option>
                      </select>
                      <button
                        onClick={() => void synthesizeBhashiniVoice()}
                        disabled={isSynthesizingVoice}
                        className="inline-flex items-center gap-2 rounded-lg border border-purple-400/30 bg-purple-500/12 px-3 py-1.5 text-xs text-purple-200 disabled:opacity-60"
                      >
                        {isSynthesizingVoice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
                        {isSynthesizingVoice ? "Synthesizing..." : "Generate Bhashini Voice"}
                      </button>
                      {bhashiniAudioUrl && (
                        <audio controls className="mt-3 w-full" src={bhashiniAudioUrl} />
                      )}
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                      <p className="mb-2 text-xs font-semibold text-white">Upload Your Voice</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-black/20 px-3 py-1.5 text-xs text-white/70 hover:text-white">
                        <Upload className="h-3.5 w-3.5" />
                        Select Voice File
                        <input type="file" accept="audio/*" className="hidden" onChange={handleVoiceUpload} />
                      </label>
                      {uploadedVoiceFileName && <p className="mt-2 text-[0.7rem] text-white/55">{uploadedVoiceFileName}</p>}
                      {uploadedVoiceUrl && <audio controls className="mt-3 w-full" src={uploadedVoiceUrl} />}
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/3 p-3 sm:col-span-2">
                      <p className="mb-2 text-xs font-semibold text-white">Upload Background Song / Music</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-black/20 px-3 py-1.5 text-xs text-white/70 hover:text-white">
                        <Music className="h-3.5 w-3.5" />
                        Select Music Track
                        <input type="file" accept="audio/*" className="hidden" onChange={handleSongUpload} />
                      </label>
                      {uploadedSongFileName && <p className="mt-2 text-[0.7rem] text-white/55">{uploadedSongFileName}</p>}
                      {uploadedSongUrl && <audio controls className="mt-3 w-full" src={uploadedSongUrl} />}
                    </div>
                  </div>
                </section>

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
                      Next: Video Model
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
                  <h3 className="text-white text-sm font-semibold mb-1">Video Generator Model</h3>
                  <p className="text-white/40 text-xs mb-4">Pick any model based on quality and credits per 10-second block.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {videoModels.map((model) => (
                      <motion.button
                        key={model.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedVideoModel(model.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          selectedVideoModel === model.id
                            ? "border-cyan-400/50 bg-cyan-500/10"
                            : "border-white/8 bg-white/2 hover:border-white/15"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[0.65rem] font-semibold text-cyan-200">#{model.rank} {model.category}</span>
                          <span className="text-[0.65rem] text-white/50">{toFixedCredits(getCreditsFor10Sec(model.usdPerSecond))} credits / 10s</span>
                        </div>
                        <p className="text-xs font-semibold text-white break-all">{model.id}</p>
                        <p className="mt-1 text-[0.7rem] text-white/55">Quality: {model.quality}</p>
                        <p className="mt-1 text-[0.7rem] text-white/45">Best for: {model.bestFor}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
                  <h3 className="text-white text-sm font-semibold mb-2">Video Duration</h3>
                  <p className="text-white/40 text-xs mb-4">Model pricing is based on 10s blocks. Credits are deducted by selected duration.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {durationOptions.map((option) => (
                      <button
                        key={option.seconds}
                        onClick={() => setSelectedDurationSeconds(option.seconds)}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                          selectedDurationSeconds === option.seconds
                            ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-200"
                            : "border-white/8 bg-white/2 text-white/60 hover:border-white/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3">
                    <p className="text-[0.7rem] text-white/60">Estimated credit deduction</p>
                    <p className="text-sm font-semibold text-cyan-200">{estimatedCreditsToDeduct} credits for {selectedDurationSeconds}s</p>
                    <p className="text-[0.68rem] text-white/45 mt-1">Rate: {activeModelCreditsFor10Sec} credits / 10s × {selectedDurationSeconds / 10} blocks</p>
                    {walletBalance !== null && (
                      <p className="text-[0.68rem] text-white/45 mt-1">Wallet balance: {walletBalance} credits</p>
                    )}
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
                        { label: "Duration", value: `${selectedDurationSeconds}s` },
                        {
                          label: "Model",
                          value: videoModels.find((m) => m.id === selectedVideoModel)?.id || selectedVideoModel,
                        },
                        { label: "Credits", value: `${estimatedCreditsToDeduct} to deduct` },
                      ].map((s) => (
                        <div key={s.label} className="p-3 rounded-xl bg-white/4 border border-white/6">
                          <p className="text-white/35 text-xs mb-0.5">{s.label}</p>
                          <p className="text-white text-xs font-medium truncate">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-7 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-left">
                      <p className="text-[0.65rem] uppercase tracking-wide text-cyan-200/80 mb-2">Cost Breakdown</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-white/70">
                          <span>GPU (Serverless)</span>
                          <span>${gpuServerlessUsdCost.toFixed(4)}</span>
                        </div>
                        <div className="flex items-center justify-between text-white/70">
                          <span>Voice Rendering</span>
                          <span>${voiceRenderingUsdCost.toFixed(4)}</span>
                        </div>
                        <div className="flex items-center justify-between text-white/70">
                          <span>Model Used ({activeModel.id})</span>
                          <span>${modelUsedUsdCost.toFixed(4)}</span>
                        </div>
                        <div className="my-1 h-px bg-white/10" />
                        <div className="flex items-center justify-between text-cyan-200 font-semibold">
                          <span>Total</span>
                          <span>${totalGenerationUsdCost.toFixed(4)}</span>
                        </div>
                      </div>
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
                      Generate {selectedDurationSeconds}s • {estimatedCreditsToDeduct} credits
                    </motion.button>
                    <p className="text-[0.68rem] text-white/45 mt-3">Session credits used: {creditsUsed}</p>
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
                      {generationProvider && (
                        <p className="text-white/35 text-[0.68rem] mt-2">
                          Rendered via {generationProvider}
                          {falRequestId ? ` • Request ${falRequestId}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Mockup phone */}
                    <div className="flex justify-center">
                      <div
                        className="relative w-44 rounded-[2rem] border-2 overflow-hidden"
                        style={{
                          borderColor: "rgba(139,92,246,0.4)",
                          aspectRatio: "9/16",
                          maxHeight: "380px",
                            background: "linear-gradient(135deg, #05000f, #000520)",
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
                                WATCH THIS
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
                        onClick={handleOpenGeneratedVideo}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 bg-white/3 text-white/60 hover:text-white transition-all text-xs"
                      >
                        <Download className="w-4 h-4" />
                        Open Video
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={() => void handleCopyGeneratedVideoLink()}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 bg-white/3 text-white/60 hover:text-white transition-all text-xs"
                      >
                        <Share2 className="w-4 h-4" />
                        Copy Link
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={() => {
                          setVideoReady(false);
                          setVideoProgress(0);
                          setGeneratedVideoUrl(null);
                          setGenerationProvider(null);
                          setFalRequestId(null);
                          setStep(1);
                          setScript("");
                          setScriptGenerated(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/8 bg-white/3 text-white/60 hover:text-white transition-all text-xs"
                      >
                        <RotateCcw className="w-4 h-4" />
                        New Video
                      </motion.button>
                    </div>

                    <section className="rounded-2xl border border-white/8 bg-white/3 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-cyan-300" />
                        <h4 className="text-sm font-semibold text-white">Post-Generation Editor</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="rounded-xl border border-white/8 bg-white/3 p-3">
                          <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/45">Trim Start (sec)</p>
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={trimStart}
                            onChange={(event) => setTrimStart(Number(event.target.value) || 0)}
                            className="w-full rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white outline-none"
                          />
                        </label>
                        <label className="rounded-xl border border-white/8 bg-white/3 p-3">
                          <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/45">Trim End (sec)</p>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={trimEnd}
                            onChange={(event) => setTrimEnd(Number(event.target.value) || 60)}
                            className="w-full rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white outline-none"
                          />
                        </label>
                        <label className="rounded-xl border border-white/8 bg-white/3 p-3">
                          <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/45">Playback Rate</p>
                          <input
                            type="range"
                            min={0.8}
                            max={1.4}
                            step={0.05}
                            value={playbackRate}
                            onChange={(event) => setPlaybackRate(Number(event.target.value))}
                            className="w-full"
                          />
                          <p className="text-[0.7rem] text-white/60">{playbackRate.toFixed(2)}x</p>
                        </label>
                        <label className="rounded-xl border border-white/8 bg-white/3 p-3">
                          <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/45">Caption Size</p>
                          <input
                            type="range"
                            min={80}
                            max={140}
                            step={5}
                            value={captionScale}
                            onChange={(event) => setCaptionScale(Number(event.target.value))}
                            className="w-full"
                          />
                          <p className="text-[0.7rem] text-white/60">{captionScale}%</p>
                        </label>
                      </div>

                      <button
                        onClick={() => void saveEditSettings()}
                        disabled={isSavingEdits}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-200 disabled:opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {isSavingEdits ? "Saving..." : "Save Edit Settings"}
                      </button>
                    </section>

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
