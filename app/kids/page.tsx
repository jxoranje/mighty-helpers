"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type HouseholdMemberLookup = {
  household_id: string;
};

type Kid = {
  id: string;
  name: string;
  stars: number | null;
  level: number | null;
};

export default function KidsPage() {
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [kids, setKids] = useState<Kid[]>([]);

  useEffect(() => {
    async function loadKids() {
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

      const { data: kidRows, error: kidsError } = await supabase
        .from("kids")
        .select("id, name, stars, level")
        .eq("household_id", typedMemberRow.household_id)
        .order("name", { ascending: true });

      if (kidsError) {
        setPageError(kidsError.message);
        setLoading(false);
        return;
      }

      setKids((kidRows as Kid[]) || []);
      setLoading(false);
    }

    loadKids();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)] backdrop-blur">
            <p className="text-sm text-[var(--muted)]">Loading kids...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.55)_35%,_transparent_65%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-50" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="inline-flex min-h-11 sm:min-w-[190px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                ← Back to home
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex min-h-11 sm:min-w-[190px] items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Manage your household
              </Link>
            </div>

            <div className="pt-8 sm:pt-10">

              <h1 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">
                Select your name! 
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                Ready to help? Let's find out what you're going to do! 
                Click your name and see your chores, your earned stars, and your rewards.
              </p>
            </div>

            {pageError && (
              <div className="mt-8 rounded-[1.5rem] border border-[rgba(190,84,84,0.18)] bg-[rgba(255,240,240,0.92)] px-5 py-4 text-sm text-[rgb(140,62,62)] shadow-sm">
                {pageError}
              </div>
            )}

            {!pageError && kids.length === 0 ? (
              <div className="mt-10 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/75 px-5 py-6 text-sm text-[var(--muted)] shadow-sm">
                No kids have been added yet.
              </div>
            ) : (
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {kids.map((kid, index) => {
                  const tones = [
                    "bg-[linear-gradient(135deg,#8fd0ff,#7a84ff)] text-white border-[rgba(72,86,156,0.14)] shadow-[0_18px_45px_rgba(72,86,156,0.20)]",
                    "bg-[linear-gradient(135deg,#ffdca8,#ffb8a6)] text-[#5d3d2e] border-[rgba(153,108,82,0.14)] shadow-[0_18px_45px_rgba(180,128,91,0.18)]",
                    "bg-[linear-gradient(135deg,#c7f1c9,#8edfc3)] text-[#1f4d44] border-[rgba(68,121,104,0.14)] shadow-[0_18px_45px_rgba(90,161,132,0.18)]",
                  ];

                  const tone = tones[index % tones.length];
                  const softText =
                    index % 3 === 0
                      ? "text-white/80"
                      : index % 3 === 1
                      ? "text-[#7a5645]"
                      : "text-[#35665a]";

                  const chipClass =
                    index % 3 === 0
                      ? "bg-white/18 text-white"
                      : index % 3 === 1
                      ? "bg-white/55 text-[#6b4839]"
                      : "bg-white/55 text-[#27584c]";

                  return (
                    <Link
                      key={kid.id}
                      href={`/kids/${kid.id}`}
                      className={`group min-h-[220px] rounded-[1.9rem] border p-6 transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 sm:p-7 ${tone}`}
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${softText}`}>
                              Mighty Helper
                            </p>

                            <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                              {kid.name}
                            </p>
                          </div>

                          <span className={`rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition-transform duration-200 group-hover:translate-x-1 ${chipClass}`}>
                            Open →
                          </span>
                        </div>

                        <div className="mt-8">
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className={`rounded-full px-3 py-1.5 ${chipClass}`}>
                              {kid.stars ?? 0} stars
                            </span>
                            <span className={`rounded-full px-3 py-1.5 ${chipClass}`}>
                              Level {kid.level ?? 1}
                            </span>
                          </div>

                          <p className={`mt-5 text-sm leading-6 sm:text-base ${softText}`}>
                            Click here and go to your own page with your chores and rewards.
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}