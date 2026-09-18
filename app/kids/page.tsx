"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import logo from "@/app/components/images/logo.png";
import AppNav from "@/app/components/AppNav";

type HouseholdMemberLookup = {
  household_id: string;
};

type KidColor = "blue" | "orange" | "green" | "purple" | "pink" | "yellow";

type Kid = {
  id: string;
  name: string;
  stars: number | null;
  level: number | null;
  color: KidColor | null;
};

type TileStyle = {
  tile: string;
  softText: string;
  chip: string;
};

const COLOR_STYLES: Record<KidColor, TileStyle> = {
  blue: {
    tile: "bg-[linear-gradient(135deg,#8fd0ff,#7a84ff)] text-white border-[rgba(72,86,156,0.14)] shadow-[0_18px_45px_rgba(72,86,156,0.20)]",
    softText: "text-white/80",
    chip: "bg-white/18 text-white",
  },
  orange: {
    tile: "bg-[linear-gradient(135deg,#ffdca8,#ffb8a6)] text-[#5d3d2e] border-[rgba(153,108,82,0.14)] shadow-[0_18px_45px_rgba(180,128,91,0.18)]",
    softText: "text-[#7a5645]",
    chip: "bg-white/55 text-[#6b4839]",
  },
  green: {
    tile: "bg-[linear-gradient(135deg,#c7f1c9,#8edfc3)] text-[#1f4d44] border-[rgba(68,121,104,0.14)] shadow-[0_18px_45px_rgba(90,161,132,0.18)]",
    softText: "text-[#35665a]",
    chip: "bg-white/55 text-[#27584c]",
  },
  purple: {
    tile: "bg-[linear-gradient(135deg,#d9c8ff,#b79bff)] text-white border-[rgba(93,66,156,0.14)] shadow-[0_18px_45px_rgba(93,66,156,0.20)]",
    softText: "text-white/80",
    chip: "bg-white/18 text-white",
  },
  pink: {
    tile: "bg-[linear-gradient(135deg,#ffc9e3,#ff9fc0)] text-[#6b2d4a] border-[rgba(180,80,120,0.14)] shadow-[0_18px_45px_rgba(200,110,150,0.18)]",
    softText: "text-[#8a4562]",
    chip: "bg-white/55 text-[#7a3a56]",
  },
  yellow: {
    tile: "bg-[linear-gradient(135deg,#fff0a8,#ffd76a)] text-[#5d4a10] border-[rgba(153,130,42,0.14)] shadow-[0_18px_45px_rgba(180,150,60,0.18)]",
    softText: "text-[#7a6520]",
    chip: "bg-white/55 text-[#6b551a]",
  },
};

const FALLBACK_COLOR_ORDER: KidColor[] = [
  "blue",
  "orange",
  "green",
  "purple",
  "pink",
  "yellow",
];

function getTileStyle(kid: Kid, index: number): TileStyle {
  const color =
    kid.color ?? FALLBACK_COLOR_ORDER[index % FALLBACK_COLOR_ORDER.length];

  return COLOR_STYLES[color];
}

export default function KidsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [kids, setKids] = useState<Kid[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadKids() {
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

        const { data: kidRows, error: kidsError } = await supabase
          .from("kids")
          .select("id, name, stars, level, color")
          .eq("household_id", typedMemberRow.household_id)
          .is("archived_at", null)
          .order("name", { ascending: true });

        if (cancelled) return;

        if (kidsError) {
          throw kidsError;
        }

        setKids((kidRows as Kid[]) || []);
      } catch (err: unknown) {
        console.error("Unable to load helpers:", err);

        if (!cancelled) {
          setPageError(
            typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
              ? String((err as { message: string }).message)
              : "Unable to load your household helpers."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadKids();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (loading) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)] backdrop-blur">
              <p className="text-sm text-[var(--muted)]">Loading helpers…</p>
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
          <section className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.55)_35%,_transparent_65%)]" />
            <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-50" />
            <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                >
                  Parent dashboard
                </Link>

                <Image
                  src={logo}
                  alt="Mighty Helpers"
                  width={100}
                  height={100}
                  className="h-10 w-10 rounded-2xl object-cover shadow-sm sm:h-12 sm:w-12"
                  priority
                />
              </div>

              <div className="pt-8 sm:pt-10">
                <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">
                  Who is ready to help?
                </h1>

              </div>

              {pageError && (
                <div
                  className="mt-8 rounded-[1.5rem] border border-[var(--danger-border)] bg-[var(--danger-soft)] px-5 py-4 text-sm text-[var(--danger-text)] shadow-sm"
                  role="alert"
                >
                  <p>{pageError}</p>

                  {pageError === "You are not logged in." && (
                    <Link
                      href="/login"
                      className="mt-3 inline-flex font-semibold underline underline-offset-4"
                    >
                      Log in to your household
                    </Link>
                  )}
                </div>
              )}

              {!pageError && kids.length === 0 && (
                <div className="mt-10 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-white/75 px-5 py-8 text-center shadow-sm">
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    No helpers have been added yet.
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                    A parent can add a helper from the Parent Dashboard.
                  </p>

                  <Link
                    href="/dashboard"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    Open Parent Dashboard
                  </Link>
                </div>
              )}

              {!pageError && kids.length > 0 && (
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  {kids.map((kid, index) => {
                    const style = getTileStyle(kid, index);
                    const firstName = kid.name.trim().split(/\s+/)[0] || kid.name;

                    return (
                      <Link
                        key={kid.id}
                        href={`/kids/${kid.id}/chores`}
                        className={`group min-h-[220px] rounded-[1.9rem] border p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:brightness-[1.02] active:translate-y-0 sm:p-7 ${style.tile}`}
                        aria-label={`Open chores for ${kid.name}`}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p
                                className={`text-sm font-semibold uppercase tracking-[0.18em] ${style.softText}`}
                              >
                                Mighty Helper
                              </p>

                              <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                {kid.name}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition-transform duration-200 group-hover:translate-x-1 ${style.chip}`}
                            >
                              Start →
                            </span>
                          </div>

                          <div className="mt-8">
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className={`rounded-full px-3 py-1.5 ${style.chip}`}>
                                {kid.stars ?? 0} stars
                              </span>

                              <span className={`rounded-full px-3 py-1.5 ${style.chip}`}>
                                Level {kid.level ?? 1}
                              </span>
                            </div>

                            <p
                              className={`mt-5 text-sm leading-6 sm:text-base ${style.softText}`}
                            >
                              Tap to see {firstName}’s chores.
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
    </>
  );
}