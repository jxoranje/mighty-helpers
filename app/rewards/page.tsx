"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type HouseholdMemberLookup = {
  household_id: string;
};

type Reward = {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  cost_stars: number;
  is_mystery: boolean;
  is_active: boolean;
};

type RewardInsert = {
  household_id: string;
  title: string;
  description: string | null;
  cost_stars: number;
  is_mystery: boolean;
  is_active: boolean;
};

type RewardUpdate = {
  title: string;
  description: string | null;
  cost_stars: number;
  is_mystery: boolean;
};

export default function RewardsPage() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCostStars, setNewCostStars] = useState("10");
  const [newIsMystery, setNewIsMystery] = useState(false);

  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCostStars, setEditingCostStars] = useState("10");
  const [editingIsMystery, setEditingIsMystery] = useState(false);

  const [rewardPendingDeleteId, setRewardPendingDeleteId] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadRewards() {
      setLoading(true);
      setError("");
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You are not logged in.");
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
        setError(memberError.message);
        setLoading(false);
        return;
      }

      if (!typedMemberRow?.household_id) {
        setError("No household found for this user.");
        setLoading(false);
        return;
      }

      const hid = typedMemberRow.household_id;
      setHouseholdId(hid);

      const { data: rewardRows, error: rewardsError } = await supabase
        .from("rewards")
        .select(
          "id, household_id, title, description, cost_stars, is_mystery, is_active"
        )
        .eq("household_id", hid)
        .order("created_at", { ascending: true });

      if (rewardsError) {
        setError(rewardsError.message);
        setLoading(false);
        return;
      }

      setRewards((rewardRows as Reward[]) || []);
      setLoading(false);
    }

    loadRewards();
  }, [supabase]);

  async function handleCreateReward(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Household not loaded yet.");
      return;
    }

    const title = newTitle.trim();
    const costStars = parseInt(newCostStars, 10);

    if (!title) {
      setError("Please enter a reward title.");
      return;
    }

    if (Number.isNaN(costStars) || costStars < 0) {
      setError("Please enter a valid star cost.");
      return;
    }

    const rewardPayload: RewardInsert = {
      household_id: householdId,
      title,
      description: newDescription.trim() || null,
      cost_stars: costStars,
      is_mystery: newIsMystery,
      is_active: true,
    };

    const { data, error: insertError } = await supabase
      .from("rewards")
      .insert(rewardPayload as never)
      .select(
        "id, household_id, title, description, cost_stars, is_mystery, is_active"
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setRewards((prev) => [...prev, data as Reward]);
    setNewTitle("");
    setNewDescription("");
    setNewCostStars("10");
    setNewIsMystery(false);
    setMessage("Reward added.");
  }

  function startEditingReward(reward: Reward) {
    setRewardPendingDeleteId(null);
    setEditingRewardId(reward.id);
    setEditingTitle(reward.title);
    setEditingDescription(reward.description ?? "");
    setEditingCostStars(String(reward.cost_stars));
    setEditingIsMystery(reward.is_mystery);
    setError("");
    setMessage("");
  }

  function cancelEditingReward() {
    setEditingRewardId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingCostStars("10");
    setEditingIsMystery(false);
  }

  async function handleUpdateReward(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!editingRewardId || !householdId) {
      setError("No reward selected for editing.");
      return;
    }

    const title = editingTitle.trim();
    const costStars = parseInt(editingCostStars, 10);

    if (!title) {
      setError("Please enter a reward title.");
      return;
    }

    if (Number.isNaN(costStars) || costStars < 0) {
      setError("Please enter a valid star cost.");
      return;
    }

    const rewardUpdatePayload: RewardUpdate = {
      title,
      description: editingDescription.trim() || null,
      cost_stars: costStars,
      is_mystery: editingIsMystery,
    };

    const { data, error: updateError } = await supabase
      .from("rewards")
      .update(rewardUpdatePayload as never)
      .eq("id", editingRewardId)
      .eq("household_id", householdId)
      .select(
        "id, household_id, title, description, cost_stars, is_mystery, is_active"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRewards((prev) =>
      prev.map((reward) =>
        reward.id === editingRewardId ? (data as Reward) : reward
      )
    );
    setMessage("Reward updated.");
    cancelEditingReward();
  }

  async function handleDeleteReward(id: string) {
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Household not loaded yet.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("rewards")
      .delete()
      .eq("id", id)
      .eq("household_id", householdId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setRewards((prev) => prev.filter((reward) => reward.id !== id));
    setRewardPendingDeleteId(null);
    setMessage("Reward deleted.");
  }

  async function toggleRewardActive(reward: Reward) {
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Household not loaded yet.");
      return;
    }

    const { data, error: updateError } = await supabase
      .from("rewards")
      .update({ is_active: !reward.is_active } as never)
      .eq("id", reward.id)
      .eq("household_id", householdId)
      .select(
        "id, household_id, title, description, cost_stars, is_mystery, is_active"
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRewards((prev) =>
      prev.map((item) => (item.id === reward.id ? (data as Reward) : item))
    );

    setMessage(!reward.is_active ? "Reward activated." : "Reward deactivated.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)] backdrop-blur">
            <p className="text-sm text-[var(--muted)]">Loading rewards...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.55)_35%,_transparent_65%)]" />
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
                Back to manage household
              </button>
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

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] shadow-sm">
                  Household rewards
                </div>

                <h1 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Rewards
                </h1>

                <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Create, update, hide, and organize the rewards your household
                  can earn with stars.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-[rgba(255,211,112,0.42)] bg-[linear-gradient(180deg,#fff4cc_0%,#ffe7a8_100%)] p-5 shadow-[0_14px_32px_rgba(196,154,67,0.18)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b5e00]">
                  Quick snapshot
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[1.25rem] bg-white/65 p-3">
                    <p className="text-2xl font-semibold text-[#5a3d00]">
                      {rewards.length}
                    </p>
                    <p className="mt-1 text-xs text-[#8b5e00]">Total</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/65 p-3">
                    <p className="text-2xl font-semibold text-[#5a3d00]">
                      {rewards.filter((reward) => reward.is_active).length}
                    </p>
                    <p className="mt-1 text-xs text-[#8b5e00]">Active</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/65 p-3">
                    <p className="text-2xl font-semibold text-[#5a3d00]">
                      {rewards.filter((reward) => reward.is_mystery).length}
                    </p>
                    <p className="mt-1 text-xs text-[#8b5e00]">Mystery</p>
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className="mt-6 rounded-[1.25rem] border border-[rgba(91,154,111,0.18)] bg-[rgba(240,252,242,0.92)] px-4 py-3 text-sm text-[rgb(58,105,72)] shadow-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-[1.25rem] border border-[rgba(190,84,84,0.18)] bg-[rgba(255,240,240,0.92)] px-4 py-3 text-sm text-[rgb(140,62,62)] shadow-sm">
                {error}
              </div>
            )}

            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Current rewards
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Manage what kids can save up for.
                  </p>
                </div>
              </div>

              {rewards.length === 0 ? (
                <div className="mt-4 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/70 px-5 py-6 text-sm text-[var(--muted)] shadow-sm">
                  No rewards yet. Add your first reward below.
                </div>
              ) : (
                <ul className="mt-4 space-y-4">
                  {rewards.map((reward) => (
                    <li
                      key={reward.id}
                      className={`rounded-[1.75rem] border p-5 shadow-sm ${
                        reward.is_active
                          ? "border-[var(--border-soft)] bg-white/75"
                          : "border-[rgba(63,89,131,0.10)] bg-[rgba(246,243,238,0.8)] opacity-90"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-[var(--foreground)]">
                              {reward.title}
                            </p>
                            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent-strong)]">
                              {reward.cost_stars} stars
                            </span>
                            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-[var(--muted)]">
                              {reward.is_mystery ? "Mystery" : "Visible"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${
                                reward.is_active
                                  ? "bg-[rgba(220,244,227,0.9)] text-[rgb(52,110,73)]"
                                  : "bg-[rgba(238,238,238,0.9)] text-[rgb(104,104,104)]"
                              }`}
                            >
                              {reward.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          {reward.description && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                              {reward.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {rewardPendingDeleteId === reward.id ? (
                            <div className="flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-[rgba(190,84,84,0.18)] bg-[rgba(255,240,240,0.92)] px-3 py-3">
                              <span className="text-xs text-[rgb(140,62,62)]">
                                Delete this reward?
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDeleteReward(reward.id)}
                                className="rounded-full bg-[rgb(193,71,71)] px-3 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-[rgb(170,56,56)] active:bg-[rgb(144,46,46)]"
                              >
                                Delete
                              </button>

                              <button
                                type="button"
                                onClick={() => setRewardPendingDeleteId(null)}
                                className="rounded-full border border-[var(--border-strong)] bg-white px-3 py-2 text-xs font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.85)]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditingReward(reward)}
                                className="rounded-full border border-[var(--border-strong)] bg-white/85 px-3.5 py-2 text-xs font-medium text-[var(--foreground)] shadow-sm transition-colors duration-200 hover:bg-white"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleRewardActive(reward)}
                                className="rounded-full border border-[var(--border-strong)] bg-white/85 px-3.5 py-2 text-xs font-medium text-[var(--foreground)] shadow-sm transition-colors duration-200 hover:bg-white"
                              >
                                {reward.is_active ? "Deactivate" : "Activate"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  cancelEditingReward();
                                  setRewardPendingDeleteId(reward.id);
                                }}
                                className="rounded-full border border-[rgba(190,84,84,0.28)] bg-[rgba(255,240,240,0.92)] px-3.5 py-2 text-xs font-medium text-[rgb(140,62,62)] transition-colors duration-200 hover:bg-[rgba(255,230,230,1)]"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {!editingRewardId && (
              <section className="mt-10 border-t border-[var(--border-soft)] pt-8">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Add a reward
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Add something fun for kids to save up for.
                </p>

                <form onSubmit={handleCreateReward} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ice cream trip"
                      className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/70 focus:border-[var(--accent-strong)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="A fun weekend treat"
                      className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/70 focus:border-[var(--accent-strong)]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[0.55fr_1fr] md:items-end">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                        Cost in stars
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newCostStars}
                        onChange={(e) => setNewCostStars(e.target.value)}
                        className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent-strong)]"
                      />
                    </div>

                    <label className="inline-flex min-h-12 items-center gap-3 rounded-[1rem] border border-[var(--border-soft)] bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                      <input
                        type="checkbox"
                        checked={newIsMystery}
                        onChange={(e) => setNewIsMystery(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--border-strong)]"
                      />
                      Mystery reward
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 active:opacity-100"
                  >
                    Add reward
                  </button>
                </form>
              </section>
            )}

            {editingRewardId && (
              <section className="mt-10 border-t border-[var(--border-soft)] pt-8">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Edit reward
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Update the reward details below, or cancel to return to add mode.
                </p>

                <form onSubmit={handleUpdateReward} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent-strong)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent-strong)]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[0.55fr_1fr] md:items-end">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                        Cost in stars
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingCostStars}
                        onChange={(e) => setEditingCostStars(e.target.value)}
                        className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white/80 px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent-strong)]"
                      />
                    </div>

                    <label className="inline-flex min-h-12 items-center gap-3 rounded-[1rem] border border-[var(--border-soft)] bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                      <input
                        type="checkbox"
                        checked={editingIsMystery}
                        onChange={(e) => setEditingIsMystery(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--border-strong)]"
                      />
                      Mystery reward
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 active:opacity-100"
                    >
                      Save changes
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditingReward}
                      className="rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-colors duration-200 hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}