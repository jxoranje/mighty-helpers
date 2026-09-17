"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import AppNav from "@/app/components/AppNav";

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

type RewardInsert = Omit<Reward, "id">;

type RewardUpdate = Pick<
  Reward,
  "title" | "description" | "cost_stars" | "is_mystery"
>;

type NoticeType = "success" | "error";

const REWARD_SELECT =
  "id, household_id, title, description, cost_stars, is_mystery, is_active";

function Notice({
  type,
  children,
}: {
  type: NoticeType;
  children: React.ReactNode;
}) {
  const classes =
    type === "success"
      ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-text)]"
      : "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-text)]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${classes}`}>
      {children}
    </div>
  );
}

function StatCard({
  label,
  number,
  tone,
}: {
  label: string;
  number: number;
  tone: "accent" | "star" | "mystery";
}) {
  const tones = {
    accent:
      "border-[var(--border-soft)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    star: "border-[var(--star-border)] bg-[var(--star-soft)] text-[var(--star-text)]",
    mystery:
      "border-[rgba(164,140,255,0.24)] bg-[rgba(164,140,255,0.12)] text-[rgb(102,75,170)]",
  };

  return (
    <article className={`rounded-[1.5rem] border p-4 ${tones[tone]}`}>
      <p className="text-2xl font-semibold">{number}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
        {label}
      </p>
    </article>
  );
}

type RewardFormProps = {
  mode: "create" | "edit";
  title: string;
  descriptionValue: string;
  costStars: string;
  isMystery: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCostStarsChange: (value: string) => void;
  onMysteryChange: (value: boolean) => void;
  onCancel?: () => void;
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
};

function RewardForm({
  mode,
  title,
  descriptionValue,
  costStars,
  isMystery,
  submitLabel,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onCostStarsChange,
  onMysteryChange,
  onCancel,
  titleInputRef,
}: RewardFormProps) {
  const isEditing = mode === "edit";

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="reward-title"
          className="mb-2 block text-sm font-medium text-[var(--foreground)]"
        >
          Reward name
        </label>

        <input
          ref={titleInputRef}
          id="reward-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Ice cream trip"
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label
          htmlFor="reward-description"
          className="mb-2 block text-sm font-medium text-[var(--foreground)]"
        >
          Description <span className="font-normal text-[var(--muted)]">(optional)</span>
        </label>

        <textarea
          id="reward-description"
          value={descriptionValue}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="A fun weekend treat after a great week."
          rows={3}
          className="w-full resize-none rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label
          htmlFor="reward-cost"
          className="mb-2 block text-sm font-medium text-[var(--foreground)]"
        >
          Cost in stars
        </label>

        <div className="relative">
          <input
            id="reward-cost"
            type="number"
            min="0"
            value={costStars}
            onChange={(event) => onCostStarsChange(event.target.value)}
            className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 pr-16 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
          />

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--star-text)]">
            stars
          </span>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-white/80 p-4 transition-colors hover:bg-white">
        <input
          type="checkbox"
          checked={isMystery}
          onChange={(event) => onMysteryChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--accent)]"
        />

        <span>
          <span className="block text-sm font-semibold text-[var(--foreground)]">
            Make this a mystery reward
          </span>

          <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
            Helpers can see that a reward exists, but not what it is until you
            choose to reveal it.
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.24)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          {submitLabel}
        </button>

        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function RewardsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const addRewardPanelRef = useRef<HTMLElement | null>(null);
  const rewardTitleInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
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
  const [rewardPendingDeleteId, setRewardPendingDeleteId] = useState<
    string | null
  >(null);

  const [savingReward, setSavingReward] = useState(false);
  const [updatingRewardId, setUpdatingRewardId] = useState<string | null>(
    null
  );
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRewards() {
      setLoading(true);
      setNeedsLogin(false);
      setError("");
      setMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !user) {
          setNeedsLogin(true);
          return;
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

        const household = memberRow as HouseholdMemberLookup | null;

        if (!household?.household_id) {
          throw new Error("No household found for this user.");
        }

        setHouseholdId(household.household_id);

        const { data, error: rewardsError } = await supabase
          .from("rewards")
          .select(REWARD_SELECT)
          .eq("household_id", household.household_id)
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (rewardsError) {
          throw rewardsError;
        }

        setRewards((data as Reward[]) || []);
      } catch (err: unknown) {
        console.error("Unable to load rewards:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your household rewards."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRewards();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function resetNewRewardForm() {
    setNewTitle("");
    setNewDescription("");
    setNewCostStars("10");
    setNewIsMystery(false);
  }

  function cancelEditingReward() {
    setEditingRewardId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingCostStars("10");
    setEditingIsMystery(false);
    setRewardPendingDeleteId(null);
  }

  function getValidatedReward(titleValue: string, starsValue: string) {
    const title = titleValue.trim();
    const costStars = Number.parseInt(starsValue, 10);

    if (!title) {
      setError("Please enter a reward name.");
      return null;
    }

    if (Number.isNaN(costStars) || costStars < 0) {
      setError("Please enter a valid star cost.");
      return null;
    }

    return { title, costStars };
  }

  function focusRewardForm() {
    setError("");
    setMessage("");
    cancelEditingReward();

    window.setTimeout(() => {
      addRewardPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      rewardTitleInputRef.current?.focus();
    }, 0);
  }

  async function handleCreateReward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    const values = getValidatedReward(newTitle, newCostStars);

    if (!values) return;

    setSavingReward(true);

    try {
      const payload: RewardInsert = {
        household_id: householdId,
        title: values.title,
        description: newDescription.trim() || null,
        cost_stars: values.costStars,
        is_mystery: newIsMystery,
        is_active: true,
      };

      const { data, error: insertError } = await supabase
        .from("rewards")
        .insert(payload as never)
        .select(REWARD_SELECT)
        .single();

      if (insertError) {
        throw insertError;
      }

      const newReward = data as Reward;

      setRewards((previous) => [...previous, newReward]);
      resetNewRewardForm();
      setMessage(`${newReward.title} was added.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to add this reward."
      );
    } finally {
      setSavingReward(false);
    }
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

    window.setTimeout(() => {
      addRewardPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      rewardTitleInputRef.current?.focus();
    }, 0);
  }

  async function handleUpdateReward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!editingRewardId || !householdId) {
      setError("No reward selected for editing.");
      return;
    }

    const values = getValidatedReward(editingTitle, editingCostStars);

    if (!values) return;

    setSavingReward(true);

    try {
      const payload: RewardUpdate = {
        title: values.title,
        description: editingDescription.trim() || null,
        cost_stars: values.costStars,
        is_mystery: editingIsMystery,
      };

      const { data, error: updateError } = await supabase
        .from("rewards")
        .update(payload as never)
        .eq("id", editingRewardId)
        .eq("household_id", householdId)
        .select(REWARD_SELECT)
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedReward = data as Reward;

      setRewards((previous) =>
        previous.map((reward) =>
          reward.id === editingRewardId ? updatedReward : reward
        )
      );

      cancelEditingReward();
      setMessage(`${updatedReward.title} was updated.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update this reward."
      );
    } finally {
      setSavingReward(false);
    }
  }

  async function handleDeleteReward(id: string) {
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    setDeletingRewardId(id);

    try {
      const { error: deleteError } = await supabase
        .from("rewards")
        .delete()
        .eq("id", id)
        .eq("household_id", householdId);

      if (deleteError) {
        throw deleteError;
      }

      setRewards((previous) => previous.filter((reward) => reward.id !== id));
      setRewardPendingDeleteId(null);

      if (editingRewardId === id) {
        cancelEditingReward();
      }

      setMessage("Reward deleted.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this reward."
      );
    } finally {
      setDeletingRewardId(null);
    }
  }

  async function toggleRewardActive(reward: Reward) {
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    setUpdatingRewardId(reward.id);

    try {
      const { data, error: updateError } = await supabase
        .from("rewards")
        .update({ is_active: !reward.is_active } as never)
        .eq("id", reward.id)
        .eq("household_id", householdId)
        .select(REWARD_SELECT)
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedReward = data as Reward;

      setRewards((previous) =>
        previous.map((item) =>
          item.id === reward.id ? updatedReward : item
        )
      );

      setMessage(
        reward.is_active
          ? `${reward.title} was made inactive.`
          : `${reward.title} is active again.`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update this reward."
      );
    } finally {
      setUpdatingRewardId(null);
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
                Loading household rewards…
              </p>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (needsLogin) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-xl">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                Parent access
              </p>

              <h1 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--foreground)]">
                Log in to manage rewards
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Sign in to create rewards, set star costs, and manage your
                household’s reward menu.
              </p>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Log in to your household
                </Link>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }

  const activeCount = rewards.filter((reward) => reward.is_active).length;
  const mysteryCount = rewards.filter((reward) => reward.is_mystery).length;

  return (
    <>
      <AppNav />

      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />
            <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-55" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
            <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-45" />

            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                    Parent tools
                  </p>

                  <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                    Rewards
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                    Create rewards your helpers care about, set the star cost,
                    and keep their choices motivating and clear.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={focusRewardForm}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
                >
                  + Add reward
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total rewards" number={rewards.length} tone="accent" />
                <StatCard label="Active rewards" number={activeCount} tone="star" />
                <StatCard label="Mystery rewards" number={mysteryCount} tone="mystery" />
              </div>

              {(message || error) && (
                <div className="mt-6 space-y-3">
                  {message && <Notice type="success">{message}</Notice>}
                  {error && <Notice type="error">{error}</Notice>}
                </div>
              )}

              <div className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <section>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                        Reward library
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        Current rewards
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        These are the rewards your helpers can save up for with
                        stars.
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--muted-strong)]">
                      {rewards.length}{" "}
                      {rewards.length === 1 ? "reward" : "rewards"}
                    </span>
                  </div>

                  {rewards.length === 0 ? (
                    <div className="mt-5 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--star-soft)] text-3xl">
                        ★
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                        Create your first reward
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                        Start with something your family enjoys—an outing, a
                        special treat, extra screen time, or a surprise.
                      </p>

                      <button
                        type="button"
                        onClick={focusRewardForm}
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                      >
                        Add a reward
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {rewards.map((reward, index) => {
                        const isPendingDelete =
                          rewardPendingDeleteId === reward.id;
                        const isUpdating = updatingRewardId === reward.id;
                        const isDeleting = deletingRewardId === reward.id;

                        const cardTone =
                          index % 3 === 0
                            ? "border-[rgba(196,168,129,0.22)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(255,248,238,0.96))]"
                            : index % 3 === 1
                              ? "border-[rgba(119,154,196,0.20)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(244,250,255,0.96))]"
                              : "border-[rgba(126,171,139,0.20)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(245,252,246,0.96))]";

                        return (
                          <article
                            key={reward.id}
                            className={`rounded-[1.75rem] border p-5 shadow-sm transition-opacity ${
                              reward.is_active
                                ? cardTone
                                : "border-[var(--border-soft)] bg-[var(--panel-muted)] opacity-75"
                            }`}
                          >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-semibold text-[var(--foreground)]">
                                    {reward.is_mystery ? "Mystery reward" : reward.title}
                                  </h3>

                                  {reward.is_mystery && (
                                    <span className="rounded-full border border-[rgba(164,140,255,0.24)] bg-[rgba(164,140,255,0.12)] px-2.5 py-1 text-xs font-semibold text-[rgb(102,75,170)]">
                                      Mystery
                                    </span>
                                  )}

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      reward.is_active
                                        ? "bg-[var(--success-soft)] text-[var(--success-text)]"
                                        : "bg-[var(--panel-soft)] text-[var(--muted-strong)]"
                                    }`}
                                  >
                                    {reward.is_active ? "Active" : "Inactive"}
                                  </span>
                                </div>

                                {reward.is_mystery && (
                                  <p className="mt-2 text-sm font-medium text-[var(--muted-strong)]">
                                    Keep the details as a surprise until you
                                    decide to reveal it.
                                  </p>
                                )}

                                {reward.description && (
                                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                                    {reward.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--star-border)] bg-[var(--star-soft)] px-4 py-3">
                                <span className="text-xl">★</span>

                                <div>
                                  <p className="text-lg font-bold leading-none text-[var(--star-text)]">
                                    {reward.cost_stars}
                                  </p>

                                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--star-text)]">
                                    stars
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isPendingDelete ? (
                              <div className="mt-5 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                                <p className="text-sm font-medium text-[var(--danger-text)]">
                                  Delete “{reward.title}” permanently?
                                </p>

                                <p className="mt-1 text-sm leading-6 text-[var(--danger-text)]">
                                  This cannot be undone.
                                </p>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteReward(reward.id)}
                                    disabled={isDeleting}
                                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--danger-button)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--danger-button-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isDeleting ? "Deleting…" : "Yes, delete reward"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setRewardPendingDeleteId(null)}
                                    disabled={isDeleting}
                                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Keep reward
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingReward(reward)}
                                  disabled={isUpdating}
                                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Edit reward
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void toggleRewardActive(reward)}
                                  disabled={isUpdating}
                                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isUpdating
                                    ? "Saving…"
                                    : reward.is_active
                                      ? "Make inactive"
                                      : "Make active"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    cancelEditingReward();
                                    setRewardPendingDeleteId(reward.id);
                                  }}
                                  disabled={isUpdating}
                                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--danger-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section
                  ref={addRewardPanelRef}
                  className="h-fit rounded-[1.75rem] border border-[var(--border-soft)] bg-white/84 p-5 shadow-[0_12px_30px_rgba(31,41,55,0.06)] backdrop-blur sm:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                    {editingRewardId ? "Edit mode" : "Create mode"}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {editingRewardId ? "Edit reward" : "Add a reward"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {editingRewardId
                      ? "Update the details below, then save your changes."
                      : "Create something motivating for helpers to save their stars toward."}
                  </p>

                  {editingRewardId ? (
                    <RewardForm
                      mode="edit"
                      title={editingTitle}
                      descriptionValue={editingDescription}
                      costStars={editingCostStars}
                      isMystery={editingIsMystery}
                      submitLabel={savingReward ? "Saving…" : "Save changes"}
                      onSubmit={handleUpdateReward}
                      onTitleChange={setEditingTitle}
                      onDescriptionChange={setEditingDescription}
                      onCostStarsChange={setEditingCostStars}
                      onMysteryChange={setEditingIsMystery}
                      onCancel={cancelEditingReward}
                      titleInputRef={rewardTitleInputRef}
                    />
                  ) : (
                    <RewardForm
                      mode="create"
                      title={newTitle}
                      descriptionValue={newDescription}
                      costStars={newCostStars}
                      isMystery={newIsMystery}
                      submitLabel={savingReward ? "Adding reward…" : "Add reward"}
                      onSubmit={handleCreateReward}
                      onTitleChange={setNewTitle}
                      onDescriptionChange={setNewDescription}
                      onCostStarsChange={setNewCostStars}
                      onMysteryChange={setNewIsMystery}
                      titleInputRef={rewardTitleInputRef}
                    />
                  )}
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}