"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import AppNav from "@/app/components/AppNav";

type HouseholdMemberLookup = {
  household_id: string;
};

type KidColor = "blue" | "orange" | "green" | "purple" | "pink" | "yellow";

type Kid = {
  id: string;
  household_id: string;
  name: string;
  avatar: string | null;
  stars: number | null;
  level: number | null;
  streak_days: number | null;
  color: KidColor | null;
  archived_at?: string | null;
};

const KID_SELECT_COLUMNS =
  "id, household_id, name, avatar, stars, level, streak_days, color";

const KID_COLOR_OPTIONS: {
  value: KidColor;
  label: string;
  swatch: string;
}[] = [
  { value: "blue", label: "Blue", swatch: "bg-[#7a84ff]" },
  { value: "orange", label: "Orange", swatch: "bg-[#ffb8a6]" },
  { value: "green", label: "Green", swatch: "bg-[#8edfc3]" },
  { value: "purple", label: "Purple", swatch: "bg-[#b79bff]" },
  { value: "pink", label: "Pink", swatch: "bg-[#ff9fc0]" },
  { value: "yellow", label: "Yellow", swatch: "bg-[#ffd76a]" },
];

function ColorPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: KidColor;
  onChange: (value: KidColor) => void;
  idPrefix: string;
}) {
  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-[var(--foreground)]">
        Tile color
      </p>

      <div className="flex flex-wrap gap-2">
        {KID_COLOR_OPTIONS.map((option) => (
          <button
            key={`${idPrefix}-${option.value}`}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
              value === option.value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${option.swatch}`} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function KidTile({
  kid,
  onEdit,
}: {
  kid: Kid;
  onEdit: (kid: Kid) => void;
}) {
  const tileColor =
    KID_COLOR_OPTIONS.find((option) => option.value === kid.color)?.swatch ??
    "bg-[#7a84ff]";

  return (
    <article className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-[0_12px_30px_rgba(31,41,55,0.06)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 text-xl shadow-sm ${tileColor}`}
          >
            <span className="drop-shadow-sm">
              {kid.avatar?.trim() || "⭐"}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-[var(--foreground)]">
              {kid.name}
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Level {kid.level ?? 1} · {kid.streak_days ?? 0}-day streak
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-3 py-1 text-xs font-semibold text-[var(--star-text)]">
          {kid.stars ?? 0} ★
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link
          href={`/kids/${kid.id}/chores`}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--foreground)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--foreground-soft)]"
        >
          Chores
        </Link>

        <button
          type="button"
          onClick={() => onEdit(kid)}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
        >
          Edit helper
        </button>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const supabase = useMemo(() => createBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [savingKid, setSavingKid] = useState(false);
  const [deletingKidId, setDeletingKidId] = useState<string | null>(null);
  const [confirmDeleteKidId, setConfirmDeleteKidId] = useState<string | null>(
    null
  );
  const [restoringKidId, setRestoringKidId] = useState<string | null>(null);

  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [archivedKids, setArchivedKids] = useState<Kid[]>([]);

  const [isAddingKid, setIsAddingKid] = useState(false);
  const [editingKidId, setEditingKidId] = useState<string | null>(null);

  const [kidName, setKidName] = useState("");
  const [kidStars, setKidStars] = useState("0");
  const [kidLevel, setKidLevel] = useState("1");
  const [kidAvatar, setKidAvatar] = useState("");
  const [kidColor, setKidColor] = useState<KidColor>("blue");

  const [newKidName, setNewKidName] = useState("");
  const [newKidStars, setNewKidStars] = useState("0");
  const [newKidLevel, setNewKidLevel] = useState("1");
  const [newKidAvatar, setNewKidAvatar] = useState("");
  const [newKidColor, setNewKidColor] = useState<KidColor>("blue");

  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setPageError("");
      setMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !user) {
          throw new Error("You are not logged in.");
        }

        const { data: memberRow, error: memberError } = await supabase
          .from("household_members")
          .select("household_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (memberError) {
          throw memberError;
        }

        const typedMemberRow = memberRow as HouseholdMemberLookup | null;

        if (!typedMemberRow?.household_id) {
          throw new Error("No household found for this user.");
        }

        setHouseholdId(typedMemberRow.household_id);

        const { data: kidRows, error: kidsError } = await supabase
          .from("kids")
          .select(`${KID_SELECT_COLUMNS}, archived_at`)
          .eq("household_id", typedMemberRow.household_id)
          .is("archived_at", null)
          .order("name", { ascending: true });

        if (cancelled) return;

        if (kidsError) {
          throw kidsError;
        }

        const { data: archivedRows, error: archivedError } = await (
          supabase.rpc as any
        )("get_archived_kids");

        if (cancelled) return;

        if (archivedError) {
          throw archivedError;
        }

        setKids((kidRows as Kid[]) || []);
        setArchivedKids((archivedRows as Kid[]) || []);
      } catch (err: unknown) {
        console.error("Unable to load parent dashboard:", err);

        if (!cancelled) {
          setPageError(
            err instanceof Error
              ? err.message
              : "Unable to load your household dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function resetEditForm() {
    setEditingKidId(null);
    setKidName("");
    setKidStars("0");
    setKidLevel("1");
    setKidAvatar("");
    setKidColor("blue");
    setConfirmDeleteKidId(null);
  }

  function resetNewKidForm() {
    setNewKidName("");
    setNewKidStars("0");
    setNewKidLevel("1");
    setNewKidAvatar("");
    setNewKidColor("blue");
  }

  function startAddKid() {
    setPageError("");
    setMessage("");
    resetEditForm();
    resetNewKidForm();
    setIsAddingKid(true);
  }

  function closeAddKid() {
    setIsAddingKid(false);
    resetNewKidForm();
  }

  function startEditKid(kid: Kid) {
    setPageError("");
    setMessage("");
    setIsAddingKid(false);
    setConfirmDeleteKidId(null);
    setEditingKidId(kid.id);
    setKidName(kid.name);
    setKidStars(String(kid.stars ?? 0));
    setKidLevel(String(kid.level ?? 1));
    setKidAvatar(kid.avatar ?? "");
    setKidColor(kid.color ?? "blue");
  }

  async function handleEditKidSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPageError("");
    setMessage("");

    if (!editingKidId) {
      setPageError("No helper was selected for editing.");
      return;
    }

    const trimmedName = kidName.trim();
    const trimmedAvatar = kidAvatar.trim();
    const parsedStars = Number(kidStars);
    const parsedLevel = Number(kidLevel);

    if (!trimmedName) {
      setPageError("Please enter the helper’s name.");
      return;
    }

    if (!Number.isFinite(parsedStars) || parsedStars < 0) {
      setPageError("Stars must be 0 or greater.");
      return;
    }

    if (!Number.isFinite(parsedLevel) || parsedLevel < 1) {
      setPageError("Level must be 1 or greater.");
      return;
    }

    setSavingKid(true);

    try {
      const { data, error } = await supabase
        .from("kids")
        .update({
          name: trimmedName,
          avatar: trimmedAvatar || null,
          stars: parsedStars,
          level: parsedLevel,
          color: kidColor,
        } as never)
        .eq("id", editingKidId)
        .select(KID_SELECT_COLUMNS)
        .single();

      if (error) {
        throw error;
      }

      const updatedKid = data as Kid;

      setKids((previous) =>
        previous
          .map((kid) => (kid.id === updatedKid.id ? updatedKid : kid))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      setMessage(`${updatedKid.name} was updated.`);
      resetEditForm();
    } catch (err: unknown) {
      setPageError(
        err instanceof Error ? err.message : "Unable to update helper."
      );
    } finally {
      setSavingKid(false);
    }
  }

  async function handleNewKidSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPageError("");
    setMessage("");

    if (!householdId) {
      setPageError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    const trimmedName = newKidName.trim();
    const trimmedAvatar = newKidAvatar.trim();
    const parsedStars = Number(newKidStars);
    const parsedLevel = Number(newKidLevel);

    if (!trimmedName) {
      setPageError("Please enter the helper’s name.");
      return;
    }

    if (!Number.isFinite(parsedStars) || parsedStars < 0) {
      setPageError("Starting stars must be 0 or greater.");
      return;
    }

    if (!Number.isFinite(parsedLevel) || parsedLevel < 1) {
      setPageError("Starting level must be 1 or greater.");
      return;
    }

    setSavingKid(true);

    try {
      const { data, error } = await supabase
        .from("kids")
        .insert({
          household_id: householdId,
          name: trimmedName,
          avatar: trimmedAvatar || null,
          stars: parsedStars,
          level: parsedLevel,
          color: newKidColor,
        } as never)
        .select(KID_SELECT_COLUMNS)
        .single();

      if (error) {
        throw error;
      }

      const newKid = data as Kid;

      setKids((previous) =>
        [...previous, newKid].sort((a, b) => a.name.localeCompare(b.name))
      );

      setMessage(`${newKid.name} is ready to help!`);
      closeAddKid();
    } catch (err: unknown) {
      setPageError(
        err instanceof Error ? err.message : "Unable to add helper."
      );
    } finally {
      setSavingKid(false);
    }
  }

  async function handleDeleteKid(kid: Kid) {
    setPageError("");
    setMessage("");
    setDeletingKidId(kid.id);

    try {
      const { data, error } = await (supabase.rpc as any)(
        "delete_or_archive_kid",
        {
          p_kid_id: kid.id,
        }
      );

      if (error) {
        throw error;
      }

      setKids((previous) => previous.filter((entry) => entry.id !== kid.id));
      setConfirmDeleteKidId(null);

      if (editingKidId === kid.id) {
        resetEditForm();
      }

      if (data === "deleted") {
        setMessage(`${kid.name} was deleted.`);
      } else if (data === "archived") {
        setMessage(`${kid.name} was archived because they already have history.`);
      } else {
        setMessage(`${kid.name} was removed.`);
      }
    } catch (err: unknown) {
      setPageError(
        err instanceof Error ? err.message : "Unable to remove helper."
      );
    } finally {
      setDeletingKidId(null);
    }
  }

  async function handleRestoreKid(kid: Kid) {
    setPageError("");
    setMessage("");
    setRestoringKidId(kid.id);

    try {
      const { data, error } = await (supabase.rpc as any)("restore_kid", {
        p_kid_id: kid.id,
      });

      if (error) {
        throw error;
      }

      const restoredKid = data as Kid;

      setArchivedKids((previous) =>
        previous.filter((entry) => entry.id !== kid.id)
      );

      setKids((previous) =>
        [...previous, restoredKid].sort((a, b) => a.name.localeCompare(b.name))
      );

      setMessage(`${kid.name} was restored.`);
    } catch (err: unknown) {
      setPageError(
        err instanceof Error ? err.message : "Unable to restore helper."
      );
    } finally {
      setRestoringKidId(null);
    }
  }

  async function handleCancelSubscription() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You will keep access until the end of the current billing period, but it will not renew."
    );

    if (!confirmed) return;

    setSubscriptionMessage("");
    setSubscriptionError("");
    setCancelingSubscription(true);

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to cancel subscription.");
      }

      const periodEndDate = data.periodEnd
        ? new Date(data.periodEnd).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "the end of your current billing period";

      setSubscriptionMessage(
        `Your subscription is set to cancel. You will keep access until ${periodEndDate}.`
      );
    } catch (err: unknown) {
      setSubscriptionError(
        err instanceof Error ? err.message : "Unable to cancel subscription."
      );
    } finally {
      setCancelingSubscription(false);
    }
  }

  if (loading) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--muted)]">
                Loading your parent dashboard…
              </p>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppNav />

      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />
            <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-55" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />

            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                    Parent dashboard
                  </p>

                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                    Your household, all in one place
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                    Add helpers, create chores and rewards, and keep your
                    household routine running smoothly.
                  </p>
                </div>

                <Link
                  href="/kids"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
                >
                  Open kid screen
                </Link>
              </div>

              {(pageError || message) && (
                <div className="mt-6 space-y-3">
                  {pageError && (
                    <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                      {pageError}
                    </div>
                  )}

                  {message && (
                    <div className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
                      {message}
                    </div>
                  )}
                </div>
              )}

              {!pageError && (
                <>
                  <section className="mt-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                          Quick actions
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                          Set up your household
                        </h2>
                      </div>

                      <p className="text-sm text-[var(--muted)]">
                        Choose what you would like to do next.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                      <article className="rounded-[1.75rem] bg-[var(--accent)] p-6 text-white shadow-[0_16px_36px_rgba(15,118,110,0.24)]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 text-2xl">
                          +
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                          Add a helper
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-white/82">
                          Create a child profile so they can select themselves,
                          see chores, and earn stars.
                        </p>

                        <button
                          type="button"
                          onClick={startAddKid}
                          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[var(--accent-strong)] shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white/92"
                        >
                          Add helper
                        </button>
                      </article>

                      <Link
                        href="/chores"
                        className="group rounded-[1.75rem] border border-[var(--border-soft)] bg-white/82 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_16px_36px_rgba(33,53,85,0.10)]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--star-soft)] text-2xl">
                          ✓
                        </div>

                        <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">
                          Create chores
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Add tasks, assign them to helpers, and decide how
                          many stars each chore earns.
                        </p>

                        <span className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] transition-transform group-hover:translate-x-1">
                          Manage chores →
                        </span>
                      </Link>

                      <Link
                        href="/rewards"
                        className="group rounded-[1.75rem] border border-[var(--border-soft)] bg-white/82 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_16px_36px_rgba(33,53,85,0.10)]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(164,140,255,0.14)] text-2xl">
                          ★
                        </div>

                        <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">
                          Create rewards
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Add rewards your family cares about and set the star
                          cost for each one.
                        </p>

                        <span className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] transition-transform group-hover:translate-x-1">
                          Manage rewards →
                        </span>
                      </Link>
                    </div>
                  </section>

                  {isAddingKid && (
                    <section className="mt-6 rounded-[1.75rem] border border-[var(--accent)] bg-[var(--accent-soft)] p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                            New helper
                          </p>

                          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                            Add a child profile
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                            They can choose their profile from the kid screen
                            without needing an email address or password.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={closeAddKid}
                          disabled={savingKid}
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Close
                        </button>
                      </div>

                      <form
                        onSubmit={handleNewKidSubmit}
                        className="mt-6 grid gap-4 lg:grid-cols-2"
                      >
                        <div>
                          <label
                            htmlFor="new-kid-name"
                            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                          >
                            Helper name
                          </label>

                          <input
                            id="new-kid-name"
                            type="text"
                            value={newKidName}
                            onChange={(event) =>
                              setNewKidName(event.target.value)
                            }
                            placeholder="Enter helper name"
                            className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="new-kid-avatar"
                            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                          >
                            Avatar
                          </label>

                          <input
                            id="new-kid-avatar"
                            type="text"
                            value={newKidAvatar}
                            onChange={(event) =>
                              setNewKidAvatar(event.target.value)
                            }
                            placeholder="Optional emoji or short label"
                            className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="new-kid-stars"
                              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                            >
                              Starting stars
                            </label>

                            <input
                              id="new-kid-stars"
                              type="number"
                              min="0"
                              value={newKidStars}
                              onChange={(event) =>
                                setNewKidStars(event.target.value)
                              }
                              className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="new-kid-level"
                              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                            >
                              Starting level
                            </label>

                            <input
                              id="new-kid-level"
                              type="number"
                              min="1"
                              value={newKidLevel}
                              onChange={(event) =>
                                setNewKidLevel(event.target.value)
                              }
                              className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                            />
                          </div>
                        </div>

                        <ColorPicker
                          value={newKidColor}
                          onChange={setNewKidColor}
                          idPrefix="new-kid"
                        />

                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={savingKid}
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.25)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingKid ? "Adding helper…" : "Add helper"}
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  <section className="mt-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                          Your helpers
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                          Active helper profiles
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Edit profiles or jump directly into a helper’s chores.
                        </p>
                      </div>

                      <div className="inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--muted-strong)]">
                        {kids.length} active{" "}
                        {kids.length === 1 ? "helper" : "helpers"}
                      </div>
                    </div>

                    {kids.length === 0 ? (
                      <div className="mt-5 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-8 text-center">
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          Add your first helper to get started.
                        </p>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                          Create a profile, then add chores and rewards that
                          fit your household.
                        </p>

                        <button
                          type="button"
                          onClick={startAddKid}
                          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                        >
                          Add a helper
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {kids.map((kid) => {
                          const isEditing = editingKidId === kid.id;
                          const isDeleting = deletingKidId === kid.id;
                          const isConfirmingDelete =
                            confirmDeleteKidId === kid.id;

                          if (!isEditing) {
                            return (
                              <KidTile
                                key={kid.id}
                                kid={kid}
                                onEdit={startEditKid}
                              />
                            );
                          }

                          return (
                            <article
                              key={kid.id}
                              className="rounded-[1.75rem] border border-[var(--accent)] bg-[var(--accent-soft)] p-5 shadow-[0_12px_30px_rgba(15,118,110,0.10)]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                                    Editing helper
                                  </p>

                                  <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                                    {kid.name}
                                  </h3>
                                </div>

                                <span className="inline-flex rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-3 py-1 text-xs font-semibold text-[var(--star-text)]">
                                  {kid.stars ?? 0} ★
                                </span>
                              </div>

                              <form
                                onSubmit={handleEditKidSubmit}
                                className="mt-5 space-y-4"
                              >
                                <div>
                                  <label
                                    htmlFor={`kid-name-${kid.id}`}
                                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                                  >
                                    Helper name
                                  </label>

                                  <input
                                    id={`kid-name-${kid.id}`}
                                    type="text"
                                    value={kidName}
                                    onChange={(event) =>
                                      setKidName(event.target.value)
                                    }
                                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label
                                      htmlFor={`kid-stars-${kid.id}`}
                                      className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                                    >
                                      Stars
                                    </label>

                                    <input
                                      id={`kid-stars-${kid.id}`}
                                      type="number"
                                      min="0"
                                      value={kidStars}
                                      onChange={(event) =>
                                        setKidStars(event.target.value)
                                      }
                                      className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor={`kid-level-${kid.id}`}
                                      className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                                    >
                                      Level
                                    </label>

                                    <input
                                      id={`kid-level-${kid.id}`}
                                      type="number"
                                      min="1"
                                      value={kidLevel}
                                      onChange={(event) =>
                                        setKidLevel(event.target.value)
                                      }
                                      className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor={`kid-avatar-${kid.id}`}
                                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                                  >
                                    Avatar
                                  </label>

                                  <input
                                    id={`kid-avatar-${kid.id}`}
                                    type="text"
                                    value={kidAvatar}
                                    onChange={(event) =>
                                      setKidAvatar(event.target.value)
                                    }
                                    placeholder="Optional emoji or short label"
                                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                                  />
                                </div>

                                <ColorPicker
                                  value={kidColor}
                                  onChange={setKidColor}
                                  idPrefix={`edit-${kid.id}`}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="submit"
                                    disabled={savingKid}
                                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {savingKid ? "Saving…" : "Save"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={resetEditForm}
                                    disabled={savingKid}
                                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Cancel
                                  </button>
                                </div>

                                {isConfirmingDelete ? (
                                  <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                                    <p className="text-xs leading-5 text-[var(--danger-text)]">
                                      Empty profiles are deleted. Profiles with
                                      chore or reward history are archived so
                                      their history is preserved.
                                    </p>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteKidId(null)
                                        }
                                        disabled={isDeleting}
                                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        Keep helper
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleDeleteKid(kid)
                                        }
                                        disabled={isDeleting}
                                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--danger-button)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--danger-button-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isDeleting
                                          ? "Removing…"
                                          : "Confirm remove"}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmDeleteKidId(kid.id)
                                    }
                                    disabled={savingKid || isDeleting}
                                    className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--danger-border)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Remove helper
                                  </button>
                                )}
                              </form>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="mt-8">
                    <details className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/70 p-5 shadow-sm">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            Archived helpers ({archivedKids.length})
                          </p>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Archived profiles keep history and can be restored
                            whenever needed.
                          </p>
                        </div>

                        <span className="text-lg text-[var(--muted)]">⌄</span>
                      </summary>

                      <div className="mt-5">
                        {archivedKids.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] px-5 py-6 text-sm text-[var(--muted)]">
                            No archived helpers.
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {archivedKids.map((kid) => (
                              <article
                                key={kid.id}
                                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                      {kid.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-[var(--muted)]">
                                      Archived helper profile
                                    </p>
                                  </div>

                                  <span className="rounded-full border border-[var(--border-strong)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted-strong)]">
                                    Archived
                                  </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                  <div className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                                      Level
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                                      {kid.level ?? 1}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                                      Streak
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                                      {kid.streak_days ?? 0} days
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => void handleRestoreKid(kid)}
                                  disabled={restoringKidId === kid.id}
                                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {restoringKidId === kid.id
                                    ? "Restoring…"
                                    : "Restore helper"}
                                </button>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </section>

                  <section className="mt-8 border-t border-[var(--border-soft)] pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          Subscription
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Manage your Mighty Helpers membership.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleCancelSubscription()}
                        disabled={cancelingSubscription}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--danger-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancelingSubscription
                          ? "Canceling…"
                          : "Cancel subscription"}
                      </button>
                    </div>

                    {subscriptionMessage && (
                      <p className="mt-3 rounded-xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
                        {subscriptionMessage}
                      </p>
                    )}

                    {subscriptionError && (
                      <p className="mt-3 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                        {subscriptionError}
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}