"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type HouseholdMemberLookup = {
  household_id: string;
};

type Kid = {
  id: string;
  household_id: string;
  name: string;
  avatar: string | null;
  stars: number | null;
  level: number | null;
  streak_days: number | null;
  archived_at?: string | null;
};

export default function DashboardPage() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingKid, setSavingKid] = useState(false);
  const [deletingKidId, setDeletingKidId] = useState<string | null>(null);
  const [confirmDeleteKidId, setConfirmDeleteKidId] = useState<string | null>(null);
  const [restoringKidId, setRestoringKidId] = useState<string | null>(null);

  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [archivedKids, setArchivedKids] = useState<Kid[]>([]);

  const [editingKidId, setEditingKidId] = useState<string | null>(null);
  const [kidName, setKidName] = useState("");
  const [kidStars, setKidStars] = useState("0");
  const [kidLevel, setKidLevel] = useState("1");
  const [kidAvatar, setKidAvatar] = useState("");

  const [newKidName, setNewKidName] = useState("");
  const [newKidStars, setNewKidStars] = useState("0");
  const [newKidLevel, setNewKidLevel] = useState("1");
  const [newKidAvatar, setNewKidAvatar] = useState("");

  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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

      setHouseholdId(typedMemberRow.household_id);

      const { data: kidRows, error: kidsError } = await supabase
        .from("kids")
        .select("id, household_id, name, avatar, stars, level, streak_days, archived_at")
        .eq("household_id", typedMemberRow.household_id)
        .is("archived_at", null)
        .order("name", { ascending: true });

      if (kidsError) {
        setPageError(kidsError.message);
        setLoading(false);
        return;
      }

      const { data: archivedRows, error: archivedError } = await (supabase.rpc as any)(
        "get_archived_kids"
      );

      if (archivedError) {
        setPageError(archivedError.message);
        setLoading(false);
        return;
      }

      setKids((kidRows as Kid[]) || []);
      setArchivedKids((archivedRows as Kid[]) || []);
      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  function resetEditForm() {
    setEditingKidId(null);
    setKidName("");
    setKidStars("0");
    setKidLevel("1");
    setKidAvatar("");
  }

  function resetNewKidForm() {
    setNewKidName("");
    setNewKidStars("0");
    setNewKidLevel("1");
    setNewKidAvatar("");
  }

  function startEditKid(kid: Kid) {
    setPageError("");
    setMessage("");
    setConfirmDeleteKidId(null);
    setEditingKidId(kid.id);
    setKidName(kid.name);
    setKidStars(String(kid.stars ?? 0));
    setKidLevel(String(kid.level ?? 1));
    setKidAvatar(kid.avatar ?? "");
  }

  async function handleEditKidSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPageError("");
    setMessage("");

    if (!editingKidId) {
      setPageError("No child selected for editing.");
      return;
    }

    const trimmedName = kidName.trim();
    const trimmedAvatar = kidAvatar.trim();

    if (!trimmedName) {
      setPageError("Please enter the child’s name.");
      return;
    }

    const parsedStars = Number(kidStars);
    const parsedLevel = Number(kidLevel);

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
        } as never)
        .eq("id", editingKidId)
        .select("id, household_id, name, avatar, stars, level, streak_days")
        .single();

      if (error) {
        throw error;
      }

      const updatedKid = data as Kid;

      setKids((prev) =>
        prev
          .map((kid) => (kid.id === updatedKid.id ? updatedKid : kid))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      setMessage("Child updated.");
      resetEditForm();
    } catch (err: any) {
      setPageError(err?.message || "Unable to update child.");
    } finally {
      setSavingKid(false);
    }
  }

  async function handleSignOut() {
    setPageError("");
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setPageError(error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  async function handleCancelSubscription() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You'll keep access until the end of your current billing period, then it won't renew."
    );

    if (!confirmed) return;

    setSubscriptionMessage("");
    setSubscriptionError("");
    setCancelingSubscription(true);

    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
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
        `Your subscription is set to cancel. You'll keep access until ${periodEndDate}.`
      );
    } catch (err: any) {
      setSubscriptionError(err?.message || "Unable to cancel subscription.");
    } finally {
      setCancelingSubscription(false);
    }
  }

  async function handleNewKidSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPageError("");
    setMessage("");

    if (!householdId) {
      setPageError("Household not loaded yet.");
      return;
    }

    const trimmedName = newKidName.trim();
    const trimmedAvatar = newKidAvatar.trim();

    if (!trimmedName) {
      setPageError("Please enter the child’s name.");
      return;
    }

    const parsedStars = Number(newKidStars);
    const parsedLevel = Number(newKidLevel);

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
        .insert({
          household_id: householdId,
          name: trimmedName,
          avatar: trimmedAvatar || null,
          stars: parsedStars,
          level: parsedLevel,
        } as never)
        .select("id, household_id, name, avatar, stars, level, streak_days")
        .single();

      if (error) {
        throw error;
      }

      const newKid = data as Kid;

      setKids((prev) =>
        [...prev, newKid].sort((a, b) => a.name.localeCompare(b.name))
      );

      setMessage("Child added.");
      resetNewKidForm();
    } catch (err: any) {
      setPageError(err?.message || "Unable to add child.");
    } finally {
      setSavingKid(false);
    }
  }

  async function handleDeleteKid(kid: Kid) {
    setPageError("");
    setMessage("");
    setDeletingKidId(kid.id);

    try {
      const { data, error } = await (supabase.rpc as any)("delete_or_archive_kid", {
        p_kid_id: kid.id,
      });

      if (error) {
        throw error;
      }

      setKids((prev) => prev.filter((entry) => entry.id !== kid.id));
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
    } catch (err: any) {
      setPageError(err?.message || "Unable to remove child.");
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

      setArchivedKids((prev) => prev.filter((entry) => entry.id !== kid.id));
      setKids((prev) =>
        [...prev, restoredKid].sort((a, b) => a.name.localeCompare(b.name))
      );

      setMessage(`${kid.name} was restored.`);
    } catch (err: any) {
      setPageError(err?.message || "Unable to restore child.");
    } finally {
      setRestoringKidId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">Loading household hub...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />
          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                   Parent Dashboard
                </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  Your household, all in one place
                  </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                    Manage your helpers, build chores and rewards, and keep your household running smoothly.
                    </p>
              </div>

              {pageError && pageError === "You are not logged in." && (
                <div className="mt-5">
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    Log in to your household
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap gap-2">

                <Link
                  href="/kids"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
                >
                  Go the the Kid Screen
                </Link>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--danger-border)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--danger-text)] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--danger-border)] hover:bg-[var(--danger-soft)] active:translate-y-0"
              >
                Log out
              </button>
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
  <div className="grid gap-6 xl:grid-cols-3">
    <div className="xl:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
            Your helpers
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Kids
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Quick actions, progress, and profile updates in one place.
          </p>
        </div>

        <div className="rounded-full border border-[var(--border-soft)] bg-white/70 px-4 py-2 text-xs font-medium text-[var(--muted-strong)]">
          {kids.length} active {kids.length === 1 ? "profile" : "profiles"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {kids.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-8">
                        <p className="text-sm text-[var(--muted)]">
                          No kids found in this household yet.
                        </p>
                      </div>
                    ) : (
                      kids.map((kid) => {
                        const isEditing = editingKidId === kid.id;
                        const isDeleting = deletingKidId === kid.id;
                        const isConfirmingDelete = confirmDeleteKidId === kid.id;

                        return (
                          <article
                            key={kid.id}
                            className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]"
                          >
                            {isEditing ? (
                              <form onSubmit={handleEditKidSubmit}>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-[var(--foreground)]">
                                      Edit child
                                    </h3>
                                    <p className="mt-1 text-sm text-[var(--muted)]">
                                      Update this profile without leaving the dashboard.
                                    </p>
                                  </div>

                                  <span className="inline-flex rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-3 py-1 text-xs font-semibold text-[var(--star-text)]">
                                    {kid.stars ?? 0} stars
                                  </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                  <div>
                                    <label
                                      htmlFor={`kid-name-${kid.id}`}
                                      className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                                    >
                                      Child name
                                    </label>
                                    <input
                                      id={`kid-name-${kid.id}`}
                                      type="text"
                                      value={kidName}
                                      onChange={(e) => setKidName(e.target.value)}
                                      className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
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
                                        onChange={(e) => setKidStars(e.target.value)}
                                        className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
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
                                        onChange={(e) => setKidLevel(e.target.value)}
                                        className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
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
                                      onChange={(e) => setKidAvatar(e.target.value)}
                                      placeholder="Optional avatar name or emoji"
                                      className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                                    />
                                  </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-2">
                                  <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                      type="submit"
                                      disabled={savingKid}
                                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {savingKid ? "Saving..." : "Save changes"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={resetEditForm}
                                      disabled={savingKid}
                                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Cancel
                                    </button>
                                  </div>

                                  {isConfirmingDelete ? (
                                    <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                                      <p className="text-xs leading-5 text-[var(--danger-text)]">
                                        Empty profiles are deleted. Profiles with history are archived.
                                      </p>

                                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteKidId(null)}
                                          disabled={isDeleting}
                                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          Keep child
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteKid(kid)}
                                          disabled={isDeleting}
                                          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-[var(--danger-button)] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--danger-button-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          {isDeleting ? "Deleting..." : "Confirm delete"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteKidId(kid.id)}
                                      disabled={savingKid || isDeleting}
                                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--danger-border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--danger-text)] transition-colors duration-200 hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Delete child
                                    </button>
                                  )}
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-[var(--border-soft)] bg-white text-2xl shadow-sm">
                                      {kid.avatar?.trim() || "⭐"}
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-semibold text-[var(--foreground)]">
                                        {kid.name}
                                      </h3>
                                      <p className="mt-1 text-sm text-[var(--muted)]">
                                        Household kid profile
                                      </p>
                                    </div>
                                  </div>

                                  <span className="inline-flex rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-3 py-1 text-xs font-semibold text-[var(--star-text)]">
                                    {kid.stars ?? 0} stars
                                  </span>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                                      Level
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                                      {kid.level ?? 1}
                                    </p>
                                  </div>

                                  <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                                      Streak
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                                      {kid.streak_days ?? 0}
                                      <span className="ml-1 text-sm font-medium text-[var(--muted)]">days</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditKid(kid)}
                                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--panel-soft)]"
                                  >
                                    Edit child
                                  </button>

                                  <div className="flex flex-col gap-2 sm:flex-row">
                                    <Link
                                      href={`/kids/${kid.id}/chores`}
                                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[color:var(--foreground-soft)]"
                                    >
                                      View chores
                                    </Link>

                                    <Link
                                      href={`/kids/${kid.id}/rewards`}
                                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--panel-soft)]"
                                    >
                                      View rewards
                                    </Link>
                                  </div>
                                </div>
                              </>
                            )}
                          </article>
                        );
                      })
                    )}
      </div>
    </div>

    <aside className="space-y-4">
      <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/86 p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
          Household tools
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Plan and motivate
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Set up chores and rewards that make your routine work.
        </p>

        <div className="mt-5 space-y-3">
          <Link
            href="/chores"
            className="group block rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
              Chore library
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Chores
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Create, edit, and organize the tasks your household uses.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] transition-transform duration-200 group-hover:translate-x-1">
              Manage chores →
            </span>
          </Link>

          <Link
            href="/rewards"
            className="group block rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
              Reward library
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Rewards
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Create rewards and choose how many stars each one costs.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] transition-transform duration-200 group-hover:translate-x-1">
              Manage rewards →
            </span>
          </Link>
        </div>
      </div>
    </aside>
  </div>
</section>

                <section className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        Archived kids
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Archived profiles keep history and can be restored later.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {archivedKids.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-white/65 p-6">
                          <p className="text-sm text-[var(--muted)]">No archived kids.</p>
                        </div>
                      ) : (
                        archivedKids.map((kid) => (
                          <article
                            key={kid.id}
                            className="rounded-2xl border border-[var(--border-soft)] bg-white/82 p-5 opacity-90"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                  {kid.name}
                                </h3>
                                <p className="mt-1 text-sm text-[var(--muted)]">
                                  Archived household kid profile
                                </p>
                              </div>

                              <span className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--panel-soft)] px-3 py-1 text-xs font-medium text-[var(--muted-strong)]">
                                Archived
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                                  Level
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                                  {kid.level ?? 1}
                                </p>
                              </div>

                              <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-strong)]">
                                  Streak
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                                  {kid.streak_days ?? 0} days
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => handleRestoreKid(kid)}
                                disabled={restoringKidId === kid.id}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {restoringKidId === kid.id ? "Restoring..." : "Restore child"}
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/86 p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] backdrop-blur">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                        New profile
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        Add child
                      </h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Create a new kid profile for this household.
                      </p>
                    </div>

                    <form onSubmit={handleNewKidSubmit} className="mt-6 space-y-4">
                      <div>
                        <label
                          htmlFor="new-kid-name"
                          className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                        >
                          Child name
                        </label>
                        <input
                          id="new-kid-name"
                          type="text"
                          value={newKidName}
                          onChange={(e) => setNewKidName(e.target.value)}
                          placeholder="Enter child name"
                          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
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
                            onChange={(e) => setNewKidStars(e.target.value)}
                            className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
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
                            onChange={(e) => setNewKidLevel(e.target.value)}
                            className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                          />
                        </div>
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
                          onChange={(e) => setNewKidAvatar(e.target.value)}
                          placeholder="Optional avatar name or emoji"
                          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingKid}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingKid ? "Saving..." : "Add child"}
                      </button>
                    </form>
                  </div>
                </section>
              </>
            )}

            {!pageError && householdId && (
              <section className="mt-8 border-t border-[var(--border-soft)] pt-6">
                <p className="text-xs text-[var(--muted)]">
                  Household connected and parent dashboard loaded successfully.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={cancelingSubscription}
                    className="text-xs font-medium text-[var(--muted)] underline decoration-[var(--border-strong)] transition-colors duration-200 hover:text-[var(--danger-text)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancelingSubscription ? "Canceling..." : "Cancel subscription"}
                  </button>

                  {subscriptionMessage && (
                    <p className="mt-2 text-xs text-[var(--success-text)]">
                      {subscriptionMessage}
                    </p>
                  )}
                  {subscriptionError && (
                    <p className="mt-2 text-xs text-[var(--danger-text)]">
                      {subscriptionError}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}