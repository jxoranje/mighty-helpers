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
};

type Reward = {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  is_mystery: boolean | null;
  cost_stars: number | null;
  is_active: boolean | null;
  created_at?: string | null;
};

export default function KidRewardsPage() {
  const supabase = createBrowserClient();
  const params = useParams<{ id: string }>();
  const kidId = params.id;

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [kid, setKid] = useState<Kid | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);

  useEffect(() => {
    async function loadKidRewardsPage() {
      setLoading(true);
      setPageError("");
      setPageMessage("");

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

      const { data: kidRow, error: kidError } = await supabase
        .from("kids")
        .select("id, household_id, name, stars, level")
        .eq("id", kidId)
        .eq("household_id", hid)
        .single();

      if (kidError) {
        setPageError(kidError.message);
        setLoading(false);
        return;
      }

      setKid(kidRow as Kid);

      const { data: rewardRows, error: rewardsError } = await supabase
        .from("rewards")
        .select(
          "id, household_id, title, description, is_mystery, cost_stars, is_active, created_at"
        )
        .eq("household_id", hid)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (rewardsError) {
        setPageError(rewardsError.message);
        setLoading(false);
        return;
      }

      setRewards((rewardRows as Reward[]) || []);
      setLoading(false);
    }

    if (kidId) {
      loadKidRewardsPage();
    }
  }, [kidId, supabase]);

  async function handleRedeemReward(reward: Reward) {
    setPageError("");
    setPageMessage("");

    if (!kid || !householdId) {
      setPageError("Kid profile not loaded yet.");
      return;
    }

    const rewardCost = reward.cost_stars ?? 0;
    const currentStars = kid.stars ?? 0;

    if (currentStars < rewardCost) {
      setPageError("Not enough stars for this reward yet.");
      return;
    }

    setRedeemingRewardId(reward.id);

    const updatedStars = currentStars - rewardCost;

    const { data: updatedKid, error: updateError } = await supabase
      .from("kids")
      .update({ stars: updatedStars } as never)
      .eq("id", kid.id)
      .eq("household_id", householdId)
      .select("id, household_id, name, stars, level")
      .single();

    setRedeemingRewardId(null);

    if (updateError) {
      setPageError(updateError.message);
      return;
    }

    setKid(updatedKid as Kid);
    setPageMessage(`${kid.name} redeemed "${reward.title}" for ${rewardCost} stars.`);
  }

  const currentStars = kid?.stars ?? 0;

  const availableNow = useMemo(
    () => rewards.filter((reward) => currentStars >= (reward.cost_stars ?? 0)),
    [rewards, currentStars]
  );

  const earnNext = useMemo(
    () => rewards.filter((reward) => currentStars < (reward.cost_stars ?? 0)),
    [rewards, currentStars]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">Loading rewards...</p>
          </section>
        </div>
      </main>
    );
  }

  if (!kid) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-[2rem] border border-[var(--danger-border)] bg-white p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--danger-text)]">Kid not found.</p>
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
          <div className="pointer-events-none absolute -right-14 top-0 h-36 w-36 rounded-full bg-[var(--blob-yellow)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-28 w-28 rounded-full bg-[var(--blob-pink)] blur-3xl" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                  Reward shop
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  {kid.name}&rsquo;s rewards
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
                  Spend stars on fun rewards, surprises, and special treats waiting to be unlocked.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/kids/${kid.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    Back to profile
                  </Link>

                  <Link
                    href={`/kids/${kid.id}/chores`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    View chores
                  </Link>
                </div>
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

              <div className="min-w-[220px] rounded-[1.75rem] border border-[var(--star-border)] bg-[linear-gradient(135deg,_#fff7d6_0%,_#ffe7b8_100%)] p-5 shadow-[0_14px_30px_rgba(138,90,0,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--star-text)]">
                  Star balance
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                    {kid.stars ?? 0}
                  </span>
                  <span className="pb-1 text-sm font-medium text-[var(--star-text)]">stars</span>
                </div>
                <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                  Level {kid.level ?? 1} helper
                </p>
              </div>
            </div>

            {(pageMessage || pageError) && (
              <div className="mt-6 space-y-3">
                {pageMessage && (
                  <div className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
                    {pageMessage}
                  </div>
                )}

                {pageError && (
                  <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                    {pageError}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
              Available now
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {availableNow.length}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Rewards that can be redeemed right away.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
              Earn next
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {earnNext.length}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Rewards still waiting for more stars.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
              Motivation loop
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Keep chores, stars, and rewards connected so progress always feels visible.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Available rewards
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                The best rewards should feel exciting before they’re redeemed.
              </p>
            </div>
          </div>

          {rewards.length === 0 ? (
            <div className="mt-4 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-soft)] p-8">
              <p className="text-sm text-[var(--muted)]">No rewards are available right now.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {rewards.map((reward) => {
                const rewardCost = reward.cost_stars ?? 0;
                const canRedeem = currentStars >= rewardCost;
                const starsNeeded = Math.max(rewardCost - currentStars, 0);

                return (
                  <article
                    key={reward.id}
                    className={`rounded-[1.75rem] border p-5 shadow-sm transition-transform duration-200 ${
                      canRedeem
                        ? "border-[var(--star-border)] bg-[linear-gradient(180deg,_#fffdfa_0%,_#fff7ea_100%)] hover:-translate-y-1"
                        : "border-[var(--border-soft)] bg-white/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">
                            {reward.is_mystery ? "??? Mystery reward" : reward.title}
                          </h3>

                          <span className="inline-flex rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--star-text)]">
                            {rewardCost} stars
                          </span>

                          {reward.is_mystery ? (
                            <span className="inline-flex rounded-full border border-[var(--border-strong)] bg-[rgba(164,140,255,0.10)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground-soft)]">
                              Mystery
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                          {reward.is_mystery
                            ? "A surprise reward is waiting. Spend the stars to find out what it is."
                            : reward.description || "A fun reward to unlock."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      {canRedeem ? (
                        <div className="mb-3 rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-2 text-xs font-medium text-[var(--success-text)]">
                          Ready to redeem now.
                        </div>
                      ) : (
                        <div className="mb-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium text-[var(--muted)]">
                          {starsNeeded} more {starsNeeded === 1 ? "star" : "stars"} needed.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canRedeem || redeemingRewardId === reward.id}
                        className={`inline-flex min-h-11 w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          canRedeem
                            ? "bg-[var(--accent)] text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)] hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
                            : "cursor-not-allowed border border-[var(--border-soft)] bg-[var(--panel-muted)] text-[var(--muted)]"
                        }`}
                      >
                        {redeemingRewardId === reward.id
                          ? "Redeeming..."
                          : canRedeem
                          ? "Redeem reward"
                          : "Not enough stars yet"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}