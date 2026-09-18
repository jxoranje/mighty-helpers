"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import AppNav from "@/app/components/AppNav";

type HouseholdMemberLookup = {
  household_id: string;
};

type Kid = {
  id: string;
  household_id: string;
  name: string;
  stars: number | null;
  level: number | null;
  streak_days?: number | null;
};

type RewardPreview = {
  id: string;
  title: string;
  is_mystery: boolean | null;
  cost_stars: number | null;
  is_active: boolean | null;
};

type ChorePreview = {
  id: string;
  title: string;
  star_value: number | null;
};

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.8l2.63 5.33 5.88.86-4.26 4.15 1.01 5.86L12 16.23 6.74 19l1.01-5.86-4.26-4.15 5.88-.86L12 2.8z" />
    </svg>
  );
}

function Sparkle({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
    >
      {children}
    </span>
  );
}

export default function KidProfilePage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const params = useParams<{ id: string }>();
  const kidId = params.id;

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [kid, setKid] = useState<Kid | null>(null);
  const [rewardPreview, setRewardPreview] = useState<RewardPreview[]>([]);
  const [chores, setChores] = useState<ChorePreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadKidProfile() {
      setLoading(true);
      setPageError("");

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

        const householdId = typedMemberRow.household_id;

        const { data: kidRow, error: kidError } = await supabase
          .from("kids")
          .select("id, household_id, name, stars, level, streak_days")
          .eq("id", kidId)
          .eq("household_id", householdId)
          .maybeSingle();

        if (cancelled) return;

        if (kidError) {
          throw kidError;
        }

        if (!kidRow) {
          throw new Error("Helper not found.");
        }

        const [
          { data: rewardRows, error: rewardError },
          { data: choreRows, error: choreError },
        ] = await Promise.all([
          supabase
            .from("rewards")
            .select("id, title, is_mystery, cost_stars, is_active")
            .eq("household_id", householdId)
            .eq("is_active", true)
            .order("cost_stars", { ascending: true })
            .limit(3),
          supabase
            .from("chores")
            .select("id, title, star_value")
            .eq("household_id", householdId)
            .eq("kid_id", kidId)
            .eq("is_active", true)
            .order("title", { ascending: true }),
        ]);

        if (cancelled) return;

        if (rewardError) {
          throw rewardError;
        }

        if (choreError) {
          throw choreError;
        }

        setKid(kidRow as Kid);
        setRewardPreview((rewardRows as RewardPreview[]) || []);
        setChores((choreRows as ChorePreview[]) || []);
      } catch (err: unknown) {
        console.error("Unable to load helper profile:", err);

        if (!cancelled) {
          setPageError(
            typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
              ? String((err as { message: string }).message)
              : "Unable to load this helper profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (kidId) {
      void loadKidProfile();
    } else {
      setLoading(false);
      setPageError("No helper selected.");
    }

    return () => {
      cancelled = true;
    };
  }, [kidId, supabase]);

  const nextReward = useMemo(() => {
    if (!kid || rewardPreview.length === 0) {
      return null;
    }

    const currentStars = kid.stars ?? 0;

    return (
      rewardPreview.find(
        (reward) => (reward.cost_stars ?? 0) >= currentStars
      ) || rewardPreview[rewardPreview.length - 1]
    );
  }, [kid, rewardPreview]);

  const redeemableRewards = useMemo(() => {
    if (!kid) {
      return [];
    }

    const currentStars = kid.stars ?? 0;

    return rewardPreview.filter(
      (reward) => (reward.cost_stars ?? 0) <= currentStars
    );
  }, [kid, rewardPreview]);

  const starsNeeded =
    nextReward && kid
      ? Math.max((nextReward.cost_stars ?? 0) - (kid.stars ?? 0), 0)
      : 0;

  if (loading) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--muted)]">
                Loading helper profile…
              </p>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (pageError || !kid) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-[2rem] border border-[var(--danger-border)] bg-white p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--danger-text)]">
                {pageError || "Helper not found."}
              </p>

              <div className="mt-5">
                <Link
                  href="/kids"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                >
                  Back to helpers
                </Link>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }

  const totalAvailableStars = chores.reduce(
    (sum, chore) => sum + (chore.star_value ?? 0),
    0
  );

  return (
    <>
      <AppNav />

      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.94),_rgba(255,255,255,0.48)_38%,_transparent_70%)]" />
            <div className="pointer-events-none absolute -left-10 top-24 h-44 w-44 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-55" />
            <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-55" />
            <div className="pointer-events-none absolute bottom-0 right-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-55" />

            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/kids"
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                >
                  ← Select helpers
                </Link>

                <Link
                  href={`/kids/${kid.id}/chores`}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
                >
                  Today’s chores →
                </Link>
              </div>

              <section className="relative mt-7 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#8edfc3_0%,_#7a84ff_100%)] p-6 text-white shadow-[0_18px_45px_rgba(72,86,156,0.22)] sm:p-8">
                <Sparkle className="right-7 top-6 text-3xl text-white/75">
                  ✨
                </Sparkle>
                <Sparkle className="right-20 top-16 text-xl text-white/55">
                  ★
                </Sparkle>
                <Sparkle className="bottom-7 right-10 text-4xl text-white/40">
                  ✦
                </Sparkle>
                <Sparkle className="bottom-9 right-32 text-2xl text-white/55">
                  ✨
                </Sparkle>

                <div className="relative max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                    Helper profile
                  </p>

                  <h1 className="mt-3 font-[family:var(--font-display)] text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
                    {kid.name}
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
                    Your chores are ready. Finish them, earn stars, and get
                    closer to your next reward.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur">
                      <StarIcon className="h-4 w-4" />
                      {kid.stars ?? 0} stars
                    </span>

                    <span className="rounded-full bg-white/18 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur">
                      Level {kid.level ?? 1}
                    </span>

                    <span className="rounded-full bg-white/18 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur">
                      {kid.streak_days ?? 0}-day streak
                    </span>
                  </div>

                  <Link
                    href={`/kids/${kid.id}/chores`}
                    className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--accent)] shadow-[0_12px_30px_rgba(31,41,55,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0"
                  >
                    Open today’s chores →
                  </Link>
                </div>
              </section>

              <section className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[1.75rem] border border-[rgba(83,140,104,0.18)] bg-[linear-gradient(180deg,_rgba(236,250,240,0.96)_0%,_rgba(224,245,231,0.96)_100%)] p-5 shadow-[0_14px_30px_rgba(80,140,100,0.10)] sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f7c5f]">
                        Today’s mission
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#234034]">
                        {chores.length === 0
                          ? "No chores ready right now"
                          : `${chores.length} ${
                              chores.length === 1 ? "chore" : "chores"
                            } ready to go`}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#4f7c5f]">
                        {chores.length === 0
                          ? "Check back later or ask a parent to add a chore."
                          : `Complete today’s chores to earn up to ${totalAvailableStars} ${
                              totalAvailableStars === 1 ? "star" : "stars"
                            }.`}
                      </p>
                    </div>

                    <Link
                      href={`/kids/${kid.id}/chores`}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[rgba(83,140,104,0.22)] bg-white/85 px-5 py-2 text-sm font-semibold text-[#35684a] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                    >
                      Open chores →
                    </Link>
                  </div>

                  {chores.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {chores.slice(0, 4).map((chore) => (
                        <Link
                          key={chore.id}
                          href={`/kids/${kid.id}/chores`}
                          className="group rounded-[1.3rem] border border-[rgba(83,140,104,0.14)] bg-white/72 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-[var(--foreground)]">
                                {chore.title}
                              </p>

                              <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                                <StarIcon className="h-4 w-4 text-[var(--star-text)]" />
                                {chore.star_value ?? 0}{" "}
                                {(chore.star_value ?? 0) === 1
                                  ? "star"
                                  : "stars"}
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-[#35684a] transition-transform duration-200 group-hover:translate-x-1">
                              →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-[var(--star-border)] bg-[linear-gradient(135deg,_#fff8dc_0%,_#ffe7b8_100%)] p-5 shadow-[0_14px_30px_rgba(138,90,0,0.12)] sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--star-text)]">
                    Next reward
                  </p>

                  {nextReward ? (
                    <>
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                            {nextReward.is_mystery
                              ? "??? Mystery reward"
                              : nextReward.title}
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                            {starsNeeded === 0
                              ? "You have enough stars to unlock this now!"
                              : `${starsNeeded} more ${
                                  starsNeeded === 1 ? "star" : "stars"
                                } to go.`}
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/65 text-2xl">
                          🎁
                        </div>
                      </div>

                      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--star-border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--star-text)]">
                        <StarIcon className="h-4 w-4" />
                        Costs {nextReward.cost_stars ?? 0} stars
                      </div>
                    </>
                  ) : (
                    <div className="mt-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/65 text-2xl">
                        🎁
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[var(--foreground-soft)]">
                        No rewards are available yet. Ask a parent to add one.
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/kids/${kid.id}/rewards`}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--star-border)] bg-white/80 px-5 py-2 text-sm font-semibold text-[var(--star-text)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    Open rewards →
                  </Link>
                </div>
              </section>

              <section className="mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/78 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                      Reward preview
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      Things you can unlock
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Keep earning stars and choose a reward when you are ready.
                    </p>
                  </div>

                  <Link
                    href={`/kids/${kid.id}/rewards`}
                    className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
                  >
                    View all rewards
                  </Link>
                </div>

                {rewardPreview.length === 0 ? (
                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-6 text-sm text-[var(--muted)]">
                    No rewards are available right now.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {rewardPreview.map((reward, index) => {
                      const affordable =
                        (reward.cost_stars ?? 0) <= (kid.stars ?? 0);

                      const tone =
                        index % 3 === 0
                          ? "bg-[rgba(255,248,225,0.8)] border-[rgba(226,180,73,0.20)]"
                          : index % 3 === 1
                            ? "bg-[rgba(236,250,240,0.8)] border-[rgba(83,140,104,0.16)]"
                            : "bg-[rgba(239,241,255,0.86)] border-[rgba(122,132,255,0.18)]";

                      return (
                        <Link
                          key={reward.id}
                          href={`/kids/${kid.id}/rewards`}
                          className={`group rounded-[1.3rem] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${tone}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-[var(--foreground)]">
                                {reward.is_mystery
                                  ? "??? Mystery reward"
                                  : reward.title}
                              </p>

                              <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                                <StarIcon className="h-4 w-4 text-[var(--star-text)]" />
                                {reward.cost_stars ?? 0}{" "}
                                {(reward.cost_stars ?? 0) === 1
                                  ? "star"
                                  : "stars"}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                affordable
                                  ? "bg-[var(--success-soft)] text-[var(--success-text)]"
                                  : "bg-white/70 text-[var(--muted-strong)]"
                              }`}
                            >
                              {affordable ? "Ready!" : "Keep going"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}