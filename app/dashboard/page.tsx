"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import AppNav from "@/app/components/AppNav";
import logo from "@/app/components/images/logo.png";

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
  tile: string;
  text: string;
}[] = [
  {
    value: "blue",
    label: "Blue",
    swatch: "bg-[#7a84ff]",
    tile: "bg-[linear-gradient(135deg,#8fd0ff,#7a84ff)]",
    text: "text-white",
  },
  {
    value: "orange",
    label: "Orange",
    swatch: "bg-[#ffb8a6]",
    tile: "bg-[linear-gradient(135deg,#ffdca8,#ffb8a6)]",
    text: "text-[#5d3d2e]",
  },
  {
    value: "green",
    label: "Green",
    swatch: "bg-[#8edfc3]",
    tile: "bg-[linear-gradient(135deg,#c7f1c9,#8edfc3)]",
    text: "text-[#1f4d44]",
  },
  {
    value: "purple",
    label: "Purple",
    swatch: "bg-[#b79bff]",
    tile: "bg-[linear-gradient(135deg,#d9c8ff,#b79bff)]",
    text: "text-white",
  },
  {
    value: "pink",
    label: "Pink",
    swatch: "bg-[#ff9fc0]",
    tile: "bg-[linear-gradient(135deg,#ffc9e3,#ff9fc0)]",
    text: "text-[#6b2d4a]",
  },
  {
    value: "yellow",
    label: "Yellow",
    swatch: "bg-[#ffd76a]",
    tile: "bg-[linear-gradient(135deg,#fff0a8,#ffd76a)]",
    text: "text-[#5d4a10]",
  },
];

function getColorOption(color: KidColor | null) {
  return (
    KID_COLOR_OPTIONS.find((option) => option.value === color) ??
    KID_COLOR_OPTIONS[0]
  );
}

function getInitial(name: string, savedAvatar: string | null) {
  return savedAvatar?.trim() || name.trim().slice(0, 1).toUpperCase() || "?";
}

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
      <p className="mb-2 text-sm font-medium text-[var(--foreground)]">
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

export default function DashboardPage() {
  const supabase = useMemo(() => createBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [savingKid, setSavingKid] = useState(false);
  const [deletingKidId, setDeletingKidId] = useState<string | null>(null);
  const [restoringKidId, setRestoringKidId] = useState<string | null>(null);
  const [confirmDeleteKidId, setConfirmDeleteKidId] = useState<string | null>(
    null
  );

  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [archivedKids, setArchivedKids] = useState<Kid[]>([]);

  const [isAddingKid, setIsAddingKid] = useState(false);
  const [editingKidId, setEditingKidId] = useState<string | null>(null);

  const [newKidName, setNewKidName] = useState("");
  const [newKidStars, setNewKidStars] = useState("0");
  const [newKidLevel, setNewKidLevel] = useState("1");
  const [newKidColor, setNewKidColor] = useState<KidColor>("blue");

  const [kidName, setKidName] = useState("");
  const [kidStars, setKidStars] = useState("0");
  const [kidLevel, setKidLevel] = useState("1");
  const [kidColor, setKidColor] = useState<KidColor>("blue");

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

        const membership = memberRow as HouseholdMemberLookup | null;

        if (!membership?.household_id) {
          throw new Error("No household found for this user.");
        }

        setHouseholdId(membership.household_id);

        const { data: kidRows, error: kidsError } = await supabase
          .from("kids")
          .select(`${KID_SELECT_COLUMNS}, archived_at`)
          .eq("household_id", membership.household_id)
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
            typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
              ? String((err as { message: string }).message)
              : "Unable to load the Parent Dashboard."
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

  function resetNewKidForm() {
    setNewKidName("");
    setNewKidStars("0");
    setNewKidLevel("1");
    setNewKidColor("blue");
  }

  function resetEditForm() {
    setEditingKidId(null);
    setKidName("");
    setKidStars("0");
    setKidLevel("1");
    setKidColor("blue");
    setConfirmDeleteKidId(null);
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
    setKidColor(kid.color ?? "blue");
  }

  async function handleNewKidSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");
    setMessage("");

    if (!householdId) {
      setPageError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    const trimmedName = newKidName.trim();
    const initial = trimmedName.slice(0, 1).toUpperCase();
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
          avatar: initial || null,
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

  async function handleEditKidSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");
    setMessage("");

    if (!editingKidId) {
      setPageError("No helper selected for editing.");
      return;
    }

    const trimmedName = kidName.trim();
    const initial = trimmedName.slice(0, 1).toUpperCase();
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
          avatar: initial || null,
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

      setKids((previous) => previous.filter((item) => item.id !== kid.id));
      setConfirmDeleteKidId(null);

      if (editingKidId === kid.id) {
        resetEditForm();
      }

      if (data === "deleted") {
        setMessage(`${kid.name} was deleted.`);
      } else if (data === "archived") {
        setMessage(`${kid.name} was archived.`);
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
        previous.filter((item) => item.id !== kid.id)
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
      "Are you sure you want to cancel your subscription? You will keep access until the end of your current billing period."
    );

    if (!confirmed) {
      return;
    }

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

      const endDate = data.periodEnd
        ? new Date(data.periodEnd).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "the end of your current billing period";

      setSubscriptionMessage(
        `Your subscription is set to cancel. You will keep access until ${endDate}.`
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
                Loading Parent Dashboard…
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
            <div className="pointer-events-none absolute -left-12 top-24 h-44 w-44 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-55" />
            <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
            <div className="pointer-events-none absolute bottom-0 right-20 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-45" />

            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex items-start justify-between gap-5">
                <div>

                  <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                    Update your household
                  </h1>

                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {kids.length} {kids.length === 1 ? "helper" : "helpers"}
                  </p>
                </div>

                <Link
                  href="/kids"
                  className="shrink-0 rounded-[2rem] transition-transform duration-200 hover:-translate-y-1"
                  aria-label="Open helper selection"
                >
                  <div className="rounded-[2rem] border border-[var(--border-soft)] bg-white/72 p-2 shadow-[0_12px_30px_rgba(33,53,85,0.10)] backdrop-blur">
                    <Image
                      src={logo}
                      alt="Mighty Helpers"
                      width={112}
                      height={112}
                      className="h-20 w-20 rounded-[1.5rem] object-cover sm:h-28 sm:w-28"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {(pageError || message) && (
                <div className="mt-6 space-y-3">
                  {pageError && (
                    <div
                      className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]"
                      role="alert"
                    >
                      {pageError}
                    </div>
                  )}

                  {message && (
                    <div
                      className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]"
                      role="status"
                    >
                      {message}
                    </div>
                  )}
                </div>
              )}

              {!pageError && (
                <>
                  <section className="mt-8 grid gap-4 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={startAddKid}
                      className="group rounded-[1.75rem] bg-[var(--accent)] p-6 text-left text-white shadow-[0_16px_36px_rgba(15,118,110,0.25)] transition-transform duration-200 hover:-translate-y-1 hover:bg-[var(--accent-hover)]"
                    >
                      <div className="flex items-start justify-between">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 text-4xl font-light">
                          +
                        </span>

                        <span className="text-2xl text-white/70 transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </div>

                      <h2 className="mt-7 text-2xl font-semibold">
                        Add helper
                      </h2>

                      <p className="mt-2 text-sm font-medium text-white/80">
                        Create a new profile
                      </p>
                    </button>

                    <Link
                      href="/chores"
                      className="group rounded-[1.75rem] border border-[rgba(83,140,104,0.20)] bg-[linear-gradient(135deg,_rgba(236,250,240,0.98)_0%,_rgba(207,241,217,0.96)_100%)] p-6 shadow-[0_14px_30px_rgba(80,140,100,0.10)] transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/62 text-3xl text-[#35684a] shadow-sm">
                          ✓
                        </span>

                        <span className="text-2xl text-[#35684a] transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </div>

                      <h2 className="mt-7 text-2xl font-semibold text-[#234034]">
                        Chores
                      </h2>

                      <p className="mt-2 text-sm font-medium text-[#4f7c5f]">
                        Create and manage tasks
                      </p>
                    </Link>

                    <Link
                      href="/rewards"
                      className="group rounded-[1.75rem] border border-[var(--star-border)] bg-[linear-gradient(135deg,_#fff9e2_0%,_#ffe7a8_100%)] p-6 shadow-[0_14px_30px_rgba(138,90,0,0.12)] transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/62 text-3xl text-[var(--star-text)] shadow-sm">
                          ★
                        </span>

                        <span className="text-2xl text-[var(--star-text)] transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </div>

                      <h2 className="mt-7 text-2xl font-semibold text-[var(--foreground)]">
                        Rewards
                      </h2>

                      <p className="mt-2 text-sm font-medium text-[var(--star-text)]">
                        Create and manage rewards
                      </p>
                    </Link>
                  </section>

                  {isAddingKid && (
                    <section className="mt-6 rounded-[1.75rem] border border-[var(--accent)] bg-[var(--accent-soft)] p-5 shadow-sm sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                            New helper
                          </p>

                          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                            Add a helper
                          </h2>
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
                            placeholder="Maya"
                            className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="new-kid-stars"
                              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                            >
                              Stars
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
                              Level
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
                            {savingKid ? "Adding…" : "Add helper"}
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  <section className="mt-10">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                          Manage Helpers
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                          Your household's Mighty Helpers
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={startAddKid}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--accent)] bg-white px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        + Add helper
                      </button>
                    </div>

                    {kids.length === 0 ? (
                      <div className="mt-5 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-8 text-center">
                        <span className="text-5xl">👋</span>

                        <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                          Add your first helper
                        </p>

                        <button
                          type="button"
                          onClick={startAddKid}
                          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                        >
                          Add helper
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {kids.map((kid) => {
                          const isEditing = editingKidId === kid.id;
                          const isDeleting = deletingKidId === kid.id;
                          const isConfirmingDelete =
                            confirmDeleteKidId === kid.id;
                          const color = getColorOption(kid.color);

                          if (isEditing) {
                            return (
                              <article
                                key={kid.id}
                                className="rounded-[1.75rem] border border-[var(--accent)] bg-[var(--accent-soft)] p-5 shadow-sm"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                                  Edit helper
                                </p>

                                <form
                                  onSubmit={handleEditKidSubmit}
                                  className="mt-5 space-y-4"
                                >
                                  <div>
                                    <label
                                      htmlFor={`kid-name-${kid.id}`}
                                      className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                                    >
                                      Name
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

                                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                                    Initial:{" "}
                                    <span className="font-semibold text-[var(--foreground)]">
                                      {kidName.trim().slice(0, 1).toUpperCase() ||
                                        "—"}
                                    </span>
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
                                      <p className="text-sm font-medium text-[var(--danger-text)]">
                                        Remove {kid.name}?
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-[var(--danger-text)]">
                                        Profiles with history are archived.
                                      </p>

                                      <div className="mt-3 grid grid-cols-2 gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setConfirmDeleteKidId(null)
                                          }
                                          disabled={isDeleting}
                                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                                        >
                                          Keep
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            void handleDeleteKid(kid)
                                          }
                                          disabled={isDeleting}
                                          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--danger-button)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          {isDeleting ? "Removing…" : "Remove"}
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
                          }

                          return (
                            <article
                              key={kid.id}
                              className="overflow-hidden rounded-[1.75rem] border border-[var(--border-soft)] bg-white/84 shadow-[0_12px_30px_rgba(31,41,55,0.06)]"
                            >
                              <div
                                className={`flex items-center gap-4 p-5 ${color.tile} ${color.text}`}
                              >
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/25 text-3xl font-bold shadow-sm backdrop-blur">
                                  {getInitial(kid.name, kid.avatar)}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-2xl font-semibold tracking-tight">
                                    {kid.name}
                                  </h3>

                                  <p className="mt-1 text-sm font-medium opacity-80">
                                    Level {kid.level ?? 1}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-3 p-4">
                                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--star-text)]">
                                  ★ {kid.stars ?? 0}
                                </span>

                                <div className="flex gap-2">
                                  <Link
                                    href={`/kids/${kid.id}/chores`}
                                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                                  >
                                    Chores
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => startEditKid(kid)}
                                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="mt-8">
                    <details className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/70 p-5 shadow-sm">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          Archived helpers ({archivedKids.length})
                        </span>

                        <span className="text-xl text-[var(--muted)]">⌄</span>
                      </summary>

                      {archivedKids.length === 0 ? (
                        <p className="mt-4 text-sm text-[var(--muted)]">
                          No archived helpers.
                        </p>
                      ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {archivedKids.map((kid) => (
                            <article
                              key={kid.id}
                              className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4"
                            >
                              <p className="text-lg font-semibold text-[var(--foreground)]">
                                {kid.name}
                              </p>

                              <p className="mt-1 text-sm text-[var(--muted)]">
                                Level {kid.level ?? 1} · {kid.stars ?? 0} stars
                              </p>

                              <button
                                type="button"
                                onClick={() => void handleRestoreKid(kid)}
                                disabled={restoringKidId === kid.id}
                                className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {restoringKidId === kid.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </button>
                            </article>
                          ))}
                        </div>
                      )}
                    </details>
                  </section>

                  <section className="mt-8 border-t border-[var(--border-soft)] pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-[var(--muted)]">
                        Subscription
                      </p>

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