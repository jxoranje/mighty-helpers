"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

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

export default function KidProfilePage() {
  const supabase = createBrowserClient();
  const params = useParams<{ id: string }>();
  const kidId = params.id;

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [kid, setKid] = useState<Kid | null>(null);
  const [rewardPreview, setRewardPreview] = useState<RewardPreview[]>([]);
  const [chores, setChores] = useState<ChorePreview[]>([]);

  useEffect(() => {
    async function loadKidProfile() {
      setLoading(true);
      setPageError("");

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

      const householdId = typedMemberRow.household_id;

      const { data: kidRow, error: kidError } = await supabase
        .from("kids")
        .select("id, household_id, name, stars, level, streak_days")
        .eq("id", kidId)
        .eq("household_id", householdId)
        .maybeSingle();

      if (kidError) {
        setPageError(kidError.message);
        setLoading(false);
        return;
      }

      if (!kidRow) {
        setPageError("Kid not found.");
        setLoading(false);
        return;
      }

      setKid(kidRow as Kid);

      const { data: rewardRows, error: rewardError } = await supabase
        .from("rewards")
        .select("id, title, is_mystery, cost_stars, is_active")
        .eq("household_id", householdId)
        .eq("is_active", true)
        .order("cost_stars", { ascending: true })
        .limit(3);

      if (rewardError) {
        setPageError(rewardError.message);
        setLoading(false);
        return;
      }

      setRewardPreview((rewardRows as RewardPreview[]) || []);

      const { data: choreRows, error: choreError } = await supabase
        .from("chores")
        .select("id, title, star_value")
        .eq("household_id", householdId)
        .eq("kid_id", kidId)
        .order("title", { ascending: true });

      if (choreError) {
        setPageError(choreError.message);
        setLoading(false);
        return;
      }

      setChores((choreRows as ChorePreview[]) || []);
      setLoading(false);
    }

    if (kidId) {
      loadKidProfile();
    }
  }, [kidId, supabase]);

  const nextReward = useMemo(() => {
    if (!kid || rewardPreview.length === 0) return null;
    const currentStars = kid.stars ?? 0;
    return (
      rewardPreview.find((reward) => (reward.cost_stars ?? 0) >= currentStars) ||
      rewardPreview[rewardPreview.length - 1]
    );
  }, [kid, rewardPreview]);

  const redeemableRewards = useMemo(() => {
    if (!kid) return [];
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
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">Loading profile...</p>
          </section>
        </div>
      </main>
    );
  }

  if (pageError || !kid) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-[2rem] border border-[var(--danger-border)] bg-white p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--danger-text)]">
              {pageError || "Kid not found."}
            </p>

            <div className="mt-5">
              <Link
                href="/kids"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Back to kids
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.55)_35%,_transparent_72%)]" />
          <div className="pointer-events-none absolute -left-8 top-16 h-32 w-32 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-55" />
          <div className="pointer-events-none absolute bottom-0 right-14 h-28 w-28 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/kids"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                ← Back to kids
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Manage your household
              </Link>
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

            {/* Top: chores */}
            <section className="mt-8 rounded-[1.75rem] border border-[rgba(83,140,104,0.18)] bg-[linear-gradient(180deg,_rgba(236,250,240,0.96)_0%,_rgba(224,245,231,0.96)_100%)] p-6 shadow-[0_14px_30px_rgba(80,140,100,0.10)]">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4f7c5f]">
                    Chores
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#234034]">
                    Today’s chores
                  </h2>
                </div>
              </div>

              {chores.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  No chores are ready right now.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {chores.map((chore) => (
                    <Link
                      key={chore.id}
                      href={`/kids/${kid.id}/chores`}
                      className="group block rounded-[1.3rem] border border-[rgba(83,140,104,0.14)] bg-white/72 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--foreground)]">
                            {chore.title}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                            <StarIcon className="h-4 w-4 text-[var(--star-text)]" />
                            {chore.star_value ?? 0} stars
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-[#35684a] transition-transform duration-200 group-hover:translate-x-1">
                          Open →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Middle: rewards list, front and center */}
            <section className="mt-8 rounded-[1.75rem] border border-[rgba(226,180,73,0.20)] bg-[linear-gradient(180deg,_rgba(255,249,232,0.96)_0%,_rgba(255,241,205,0.96)_100%)] p-6 shadow-[0_14px_30px_rgba(168,122,20,0.10)]">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--star-text)]">
                    Rewards
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Rewards you can unlock
                  </h2>
                </div>

                <Link
                  href={`/kids/${kid.id}/rewards`}
                  className="hidden sm:inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--star-border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--star-text)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                >
                  Open rewards
                </Link>
              </div>

              {redeemableRewards.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  You need a few more stars before a reward is ready.
                </p>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {redeemableRewards.map((reward) => (
                    <Link
                      key={reward.id}
                      href={`/kids/${kid.id}/rewards`}
                      className="group block rounded-[1.3rem] border border-[rgba(226,180,73,0.18)] bg-white/72 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[var(--foreground)]">
                            {reward.is_mystery ? "??? Mystery reward" : reward.title}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                            <StarIcon className="h-4 w-4 text-[var(--star-text)]" />
                            {reward.cost_stars ?? 0} stars
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-[var(--star-text)] transition-transform duration-200 group-hover:translate-x-1">
                          Open →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href={`/kids/${kid.id}/rewards`}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--star-border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--star-text)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 sm:hidden"
              >
                Open rewards
              </Link>
            </section>

            {/* Bottom: helper profile (left) + next reward & preview (right) */}
            <section className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.9rem] bg-[linear-gradient(135deg,#8fd0ff,#7a84ff)] p-6 text-white shadow-[0_18px_45px_rgba(72,86,156,0.20)] sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                  Helper profile
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {kid.name}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                  Check your stars, keep your streak going, and see what reward you’re working toward next.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 font-semibold text-white">
                    <StarIcon className="h-4 w-4" />
                    {kid.stars ?? 0} stars
                  </span>
                  <span className="rounded-full bg-white/18 px-4 py-2 font-semibold text-white">
                    Level {kid.level ?? 1}
                  </span>
                  <span className="rounded-full bg-white/18 px-4 py-2 font-semibold text-white">
                    {kid.streak_days ?? 0} day streak
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-[var(--star-border)] bg-[linear-gradient(135deg,_#fff7d6_0%,_#ffe7b8_100%)] p-6 shadow-[0_14px_30px_rgba(138,90,0,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--star-text)]">
                    Next reward
                  </p>

                  {nextReward ? (
                    <>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        {nextReward.is_mystery ? "??? Mystery reward" : nextReward.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                        {starsNeeded === 0
                          ? "You have enough stars to unlock this now."
                          : `${starsNeeded} more ${starsNeeded === 1 ? "star" : "stars"} to go.`}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--star-border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--star-text)]">
                        <StarIcon className="h-4 w-4" />
                        Costs {nextReward.cost_stars ?? 0} stars
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--foreground-soft)]">
                      No rewards available yet.
                    </p>
                  )}
                </div>

                <section className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/78 p-6 shadow-sm">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                        Reward preview
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        What you can unlock
                      </h2>
                    </div>
                  </div>

                  {rewardPreview.length === 0 ? (
                    <p className="mt-4 text-sm text-[var(--muted)]">
                      No rewards available right now.
                    </p>
                  ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {rewardPreview.map((reward) => (
                        <div
                          key={reward.id}
                          className="rounded-[1.3rem] border border-[var(--border-soft)] bg-[var(--panel-soft)] p-4"
                        >
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {reward.is_mystery ? "??? Mystery reward" : reward.title}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                            <StarIcon className="h-4 w-4 text-[var(--star-text)]" />
                            {reward.cost_stars ?? 0} stars
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}