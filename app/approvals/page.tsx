"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type HouseholdMemberLookup = {
  household_id: string;
};

type ApprovalRow = {
  id: string;
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
  kids: { name: string } | { name: string }[] | null;
  chores: { title: string } | { title: string }[] | null;
};

type ApprovalItem = {
  id: string;
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
  kid_name: string;
  chore_title: string;
};

type ApproveRpcResult = {
  assignment_id: string;
  kid_id: string;
  new_status: string;
  stars_awarded: number;
  new_star_total: number;
};

function getRelatedValue(
  relation:
    | { name?: string; title?: string }
    | { name?: string; title?: string }[]
    | null,
  key: "name" | "title"
) {
  if (!relation) return "";
  if (Array.isArray(relation)) return relation[0]?.[key] ?? "";
  return relation[key] ?? "";
}

function normalizeApproval(row: ApprovalRow): ApprovalItem {
  return {
    id: row.id,
    household_id: row.household_id,
    kid_id: row.kid_id,
    chore_id: row.chore_id,
    status: row.status,
    assigned_for_date: row.assigned_for_date,
    notes: row.notes,
    kid_name: getRelatedValue(row.kids, "name"),
    chore_title: getRelatedValue(row.chores, "title"),
  };
}

function formatAssignedDate(value: string | null) {
  if (!value) return "No date assigned";
  return `Assigned for ${value}`;
}

function SectionMessage({
  type,
  children,
}: {
  type: "success" | "error";
  children: React.ReactNode;
}) {
  const styles =
    type === "success"
      ? "border-[rgba(96,145,107,0.20)] bg-[rgba(242,251,244,0.95)] text-[rgb(54,98,63)]"
      : "border-[rgba(190,84,84,0.18)] bg-[rgba(255,240,240,0.95)] text-[rgb(140,62,62)]";

  return (
    <div className={`rounded-[1.35rem] border px-4 py-3 text-sm shadow-sm ${styles}`}>
      {children}
    </div>
  );
}

function getTone(index: number) {
  const tones = [
    {
      card: "bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(255,248,238,0.98))] border-[rgba(196,168,129,0.22)]",
      pill: "bg-[rgba(255,255,255,0.82)] border-[rgba(196,168,129,0.20)] text-[var(--foreground)]",
      action: "bg-[rgba(255,247,231,0.95)] border-[rgba(222,186,121,0.30)] text-[rgb(142,96,22)]",
    },
    {
      card: "bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(244,250,255,0.98))] border-[rgba(119,154,196,0.20)]",
      pill: "bg-[rgba(255,255,255,0.82)] border-[rgba(119,154,196,0.18)] text-[var(--foreground)]",
      action: "bg-[rgba(236,246,255,0.92)] border-[rgba(141,180,219,0.26)] text-[rgb(52,96,148)]",
    },
    {
      card: "bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(245,252,246,0.98))] border-[rgba(126,171,139,0.20)]",
      pill: "bg-[rgba(255,255,255,0.82)] border-[rgba(126,171,139,0.18)] text-[var(--foreground)]",
      action: "bg-[rgba(239,249,242,0.94)] border-[rgba(130,182,145,0.26)] text-[rgb(56,112,72)]",
    },
  ];

  return tones[index % tones.length];
}

export default function ApprovalsPage() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadApprovals() {
      setLoading(true);
      setPageError("");
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setPageError("You are not logged in.");
        setLoading(false);
        return;
      }

      const { data: memberRow, error: memberError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const typedMemberRow = memberRow as HouseholdMemberLookup | null;

      if (memberError) {
        setPageError(memberError.message);
        setLoading(false);
        return;
      }

      if (!typedMemberRow?.household_id) {
        setPageError("No household found for this user.");
        setLoading(false);
        return;
      }

      const hid = typedMemberRow.household_id;
      setHouseholdId(hid);

      const { data: approvalRows, error: approvalsError } = await supabase
        .from("chore_assignments")
        .select(`
          id,
          household_id,
          kid_id,
          chore_id,
          status,
          assigned_for_date,
          notes,
          kids!chore_assignments_kid_id_fkey(name),
          chores!chore_assignments_chore_id_fkey(title)
        `)
        .eq("household_id", hid)
        .eq("status", "done")
        .order("assigned_for_date", { ascending: true, nullsFirst: true });

      if (approvalsError) {
        setPageError(approvalsError.message);
        setLoading(false);
        return;
      }

      setItems(((approvalRows as ApprovalRow[]) || []).map(normalizeApproval));
      setLoading(false);
    }

    loadApprovals();
  }, [supabase]);

  async function updateStatus(
    assignmentId: string,
    nextStatus: "approved" | "assigned"
  ) {
    setPageError("");
    setMessage("");
    setUpdatingId(assignmentId);

    if (!householdId) {
      setPageError("Household not loaded yet.");
      setUpdatingId(null);
      return;
    }

    if (nextStatus === "approved") {
      const { data, error } = await (supabase.rpc as any)(
        "approve_chore_assignment",
        {
          p_assignment_id: assignmentId,
        }
      );

      if (error) {
        setPageError(error.message);
        setUpdatingId(null);
        return;
      }

      const result: ApproveRpcResult | null = Array.isArray(data)
        ? ((data[0] as ApproveRpcResult | undefined) ?? null)
        : ((data as ApproveRpcResult | null) ?? null);

      setItems((prev) => prev.filter((item) => item.id !== assignmentId));

      if (result) {
        setMessage(
          `Chore approved. ${result.stars_awarded} stars awarded. New total: ${result.new_star_total}.`
        );
      } else {
        setMessage("Chore approved and stars awarded.");
      }

      setUpdatingId(null);
      return;
    }

    const { error } = await supabase
      .from("chore_assignments")
      .update({ status: "assigned" } as never)
      .eq("id", assignmentId)
      .eq("household_id", householdId);

    if (error) {
      setPageError(error.message);
      setUpdatingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== assignmentId));
    setMessage("Chore rejected and moved back to assigned.");
    setUpdatingId(null);
  }

  const pendingCount = items.length;

  const kidsWaitingCount = useMemo(() => {
    return new Set(items.map((item) => item.kid_id)).size;
  }, [items]);

  const withNotesCount = useMemo(() => {
    return items.filter((item) => Boolean(item.notes?.trim())).length;
  }, [items]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">Loading approvals...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.55)_34%,_transparent_72%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                ← Back to home
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Manage your household
              </button>
            </div>

{pageError && pageError === "" && (
  <div className="mt-5">
    <Link
      href="/login"
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
    >
      Log in to your household
    </Link>
  </div>
)}

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] shadow-sm">
                  Approval queue
                </div>

                <h1 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">
                  Review finished chores and keep stars moving
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Approve completed chores, send items back when needed, and keep the reward loop clean.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/72 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                    Waiting now
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {pendingCount}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/72 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                    Kids waiting
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {kidsWaitingCount}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--star-border)] bg-[linear-gradient(180deg,_#fffaf0_0%,_#fff2d6_100%)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--star-text)]">
                    With notes
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {withNotesCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {message && <SectionMessage type="success">{message}</SectionMessage>}
              {pageError && <SectionMessage type="error">{pageError}</SectionMessage>}
            </div>

            <section className="mt-8 rounded-[1.85rem] border border-[var(--border-soft)] bg-white/74 p-5 shadow-sm backdrop-blur sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                    Pending chores
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Ready for review
                  </h2>
                </div>

                <p className="text-sm text-[var(--muted)]">
                  Only chores marked done appear here.
                </p>
              </div>

              {items.length === 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--panel-soft)] px-5 py-6 text-sm text-[var(--muted)]">
                  No chores are waiting for approval right now.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {items.map((item, index) => {
                    const isUpdating = updatingId === item.id;
                    const tone = getTone(index);

                    return (
                      <article
                        key={item.id}
                        className={`rounded-[1.6rem] border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${tone.card}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pill}`}>
                                {item.kid_name || "Unknown kid"}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.pill}`}>
                                {item.chore_title || "Untitled chore"}
                              </span>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.action}`}>
                                Done
                              </span>
                            </div>

                            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                              {item.kid_name} completed {item.chore_title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)] sm:text-base">
                              {formatAssignedDate(item.assigned_for_date)}
                            </p>

                            {item.notes && (
                              <div className="mt-4 rounded-[1.2rem] border border-[var(--border-soft)] bg-white/78 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                                  Notes
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[280px] lg:justify-end">
                            <button
                              type="button"
                              onClick={() => updateStatus(item.id, "approved")}
                              disabled={isUpdating}
                              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_35px_rgba(66,109,163,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? "Saving..." : "Approve"}
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(item.id, "assigned")}
                              disabled={isUpdating}
                              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(190,84,84,0.20)] bg-white/85 px-5 py-3 text-sm font-semibold text-[rgb(140,62,62)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[rgba(255,240,240,0.95)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? "Saving..." : "Reject"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}