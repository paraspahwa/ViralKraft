import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AppNavbar } from "../components/AppNavbar";
import { CinematicBackground } from "../components/CinematicBackground";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";

type InquiryStatus = "new" | "reviewed" | "resolved" | "spam";

type InquiryRow = {
  id: string;
  full_name: string;
  email: string;
  topic: string;
  message: string;
  status: InquiryStatus;
  source: string | null;
  created_at: string;
  updated_at: string | null;
};

export function ContactInquiriesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");

  useEffect(() => {
    let mounted = true;

    async function loadInquiries() {
      if (!hasSupabaseBrowserConfig()) {
        navigate("/login?next=/dashboard/inquiries", { replace: true });
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        navigate("/login?next=/dashboard/inquiries", { replace: true });
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.access_token) {
        navigate("/login?next=/dashboard/inquiries", { replace: true });
        return;
      }

      const query = statusFilter === "all" ? "" : `?status=${statusFilter}`;
      const response = await fetch(`/api/contact-inquiries${query}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string; inquiries?: InquiryRow[] };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not load inquiries");
      }

      if (mounted) {
        setRows(payload.inquiries || []);
      }
    }

    setLoading(true);
    loadInquiries()
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load inquiries");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate, statusFilter]);

  const groupedCounts = useMemo(() => {
    const base: Record<InquiryStatus, number> = {
      new: 0,
      reviewed: 0,
      resolved: 0,
      spam: 0,
    };

    rows.forEach((row) => {
      base[row.status] += 1;
    });

    return base;
  }, [rows]);

  async function updateStatus(id: string, status: InquiryStatus) {
    try {
      setUpdatingId(id);
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase!.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        throw new Error("Please sign in again");
      }

      const response = await fetch("/api/contact-inquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not update inquiry");
      }

      setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
      toast.success("Inquiry status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <CinematicBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <AppNavbar />

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:pt-32">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Contact Inquiries</h1>
              <p className="mt-1 text-sm text-white/55">Review and triage messages submitted from the contact page.</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:border-white/30"
            >
              Back to Dashboard
            </button>
          </div>

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["new", "reviewed", "resolved", "spam"] as InquiryStatus[]).map((status) => (
              <article key={status} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-white/50">{status}</p>
                <p className="mt-1 text-2xl font-bold text-white">{groupedCounts[status]}</p>
              </article>
            ))}
          </section>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs uppercase text-white/45">Filter</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | InquiryStatus)}
              className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="spam">Spam</option>
            </select>
          </div>

          <section className="space-y-3">
            {loading && <p className="text-sm text-white/60">Loading inquiries...</p>}
            {!loading && rows.length === 0 && <p className="text-sm text-white/60">No inquiries found for this filter.</p>}

            {!loading &&
              rows.map((row) => (
                <article key={row.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-white">{row.full_name}</h2>
                      <p className="text-xs text-white/50">{row.email} • {new Date(row.created_at).toLocaleString()}</p>
                    </div>
                    <select
                      value={row.status}
                      disabled={updatingId === row.id}
                      onChange={(event) => void updateStatus(row.id, event.target.value as InquiryStatus)}
                      className="rounded-lg border border-white/15 bg-black/25 px-2.5 py-1.5 text-xs text-white disabled:opacity-60"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="spam">Spam</option>
                    </select>
                  </div>
                  <p className="mb-1 text-sm font-medium text-cyan-200">{row.topic}</p>
                  <p className="text-sm leading-relaxed text-white/75">{row.message}</p>
                </article>
              ))}
          </section>
        </main>
      </div>
    </div>
  );
}
