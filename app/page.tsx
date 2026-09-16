"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import AppNav from "@/app/components/AppNav";

type KidColor = "blue" | "orange" | "green" | "purple" | "pink" | "yellow";

type Kid = {
  id: string;
  name: string;
  stars: number | null;
  color: KidColor | null;
};

type Household = {
  id: string;
  name: string;
  onboarding_completed_at: string | null;
};

type EnsureHouseholdResult = {
  household_id: string;
  created: boolean;
};

const COLOR_DOT: Record<KidColor, string> = {
  blue: "bg-[#7a84ff]",
  orange: "bg-[#ffb8a6]",
  green: "bg-[#8edfc3]",
  purple: "bg-[#b79bff]",
  pink: "bg-[#ff9fc0]",
  yellow: "bg-[#ffd76a]",
};

const FALLBACK_COLOR_ORDER: KidColor[] = [
  "blue",
  "orange",
  "green",
  "purple",
  "pink",
  "yellow",
];

export default function HomePage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [household, setHousehold] = useState<Household | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setLoading(true);
      setPageError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: consent, error: consentError } = await supabase
        .from("user_consents")
        .select("terms_accepted_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (consentError) {
        setPageError(consentError.message);
        setLoading(false);
        return;
      }

      if (!consent?.terms_accepted_at) {
        router.replace("/accept-terms?next=/");
        return;
      }

      const { data: householdResult, error: recoveryError } = await supabase
        .rpc("ensure_my_household")
        .single();

      if (cancelled) return;

      const recovered = householdResult as EnsureHouseholdResult | null;

      if (recoveryError || !recovered?.household_id) {
        setPageError(
          recoveryError?.message ||
            "We could not load your household. Please try again."
        );
        setLoading(false);
        return;
      }

      const { data: householdRow, error: householdError } = await supabase
        .from("households")
        .select("id, name, onboarding_completed_at")
        .eq("id", recovered.household_id)
        .single();

      if (cancelled) return;

      if (householdError || !householdRow) {
        setPageError(
          householdError?.message || "Household could not be loaded."
        );
        setLoading(false);
        return;
      }

      const typedHousehold = householdRow as Household;

      if (!typedHousehold.onboarding_completed_at) {
        router.replace("/onboarding");
        return;
      }

      const { data: kidRows, error: kidsError } = await supabase
        .from("kids")
        .select("id, name, stars, color")
        .eq("household_id", typedHousehold.id)
        .is("archived_at", null)
        .order("name", { ascending: true });

      if (cancelled) return;

      if (kidsError) {
        setPageError(kidsError.message);
        setLoading(false);
        return;
      }

      setHousehold(typedHousehold);
      setKids((kidRows as Kid[]) || []);
      setLoading(false);
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <p className="text-sm text-[var(--muted)]">Loading your household...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AppNav />

      <main className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.55)_35%,_transparent_70%)]" />
            <div className="pointer-events-none absolute -left-14 top-16 h-44 w-44 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-50" />
            <div className="pointer-events-none absolute bottom-0 right-20 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

            <div className="relative p-6 sm:p-10 md:p-14">
              {pageError && (
                <div className="mb-6 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                  {pageError}
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                Welcome back
              </p>

              <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">
                {household?.name || "Your household"}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                Mighty Helpers turns everyday chores into a fun, star-earning
                adventure. Kids finish chores and collect stars instantly.
                Parents set up chores and rewards once, then step back and
                watch the routine run itself.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/kids"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
                >
                  Select Helper
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
                >
                  Manage Household
                </Link>
              </div>

              {kids.length > 0 && (
                <div className="mt-12">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                    Your helpers
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {kids.map((kid, index) => {
                      const color =
                        kid.color ??
                        FALLBACK_COLOR_ORDER[index % FALLBACK_COLOR_ORDER.length];

                      return (
                        <Link
                          key={kid.id}
                          href="/kids"
                          className="flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-white/85 px-4 py-2.5 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
                        >
                          <span
                            className={`h-3 w-3 rounded-full ${COLOR_DOT[color]}`}
                          />
                          <span className="text-sm font-semibold text-[var(--foreground)]">
                            {kid.name}
                          </span>
                          <span className="rounded-full bg-[var(--star-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--star-text)]">
                            {kid.stars ?? 0}★
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--star-soft)] text-2xl">
                🪥
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Do a chore
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Kids pick their name, see today&rsquo;s chores, and mark them
                done with one tap.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-2xl">
                ⭐
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Earn stars instantly
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                No waiting for approval. Stars land the moment a chore is
                confirmed.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(164,140,255,0.14)] text-2xl">
                🎁
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Redeem rewards
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Kids spend saved-up stars on rewards you&rsquo;ve set up, right
                from their own page.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}