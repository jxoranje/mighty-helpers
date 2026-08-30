"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import logo from "@/app/components/images/logo.png";

const included = [
  "One household with unlimited helpers",
  "Illustrated chores and flexible routines",
  "Stars, rewards, and progress tracking",
  "Parent approvals and household management",
  "Kid-friendly helper view",
];

export default function PricingPage() {
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartTrial() {
    setError("");
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/sign-up";
      return;
    }

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Checkout request failed.");
      }

      if (!payload.url) {
        throw new Error("Checkout did not return a valid URL.");
      }

      window.location.assign(payload.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong starting checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm">
              <Image src={logo} alt="Mighty Helpers" width={44} height={44} className="h-full w-full object-cover" priority />
            </span>
            <span className="text-base font-semibold tracking-tight text-[var(--foreground)]">Mighty Helpers</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/help" className="hidden text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex">Help</Link>
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:bg-white">Log in</Link>
          </div>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.56)_35%,_transparent_68%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />

          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-14">
            <div>
              <p className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">One simple family plan</p>
              <h1 className="mt-6 font-[family:var(--font-display)] text-5xl leading-[0.96] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">Everything your household needs to grow helpful habits.</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">One thoughtful plan for every helper, every routine, and every small win your family builds together.</p>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success-soft)] text-xs font-bold text-[var(--success-text)]">✓</span> 7-day free trial</span>
                <span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success-soft)] text-xs font-bold text-[var(--success-text)]">✓</span> Cancel anytime</span>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[rgba(15,118,110,0.20)] bg-white/84 p-6 shadow-[0_16px_40px_rgba(15,118,110,0.12)] backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Mighty Helpers Family Plan</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">For one whole household</p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">7 days free</span>
              </div>

              <div className="mt-7 flex items-end gap-2">
                <span className="font-[family:var(--font-display)] text-6xl tracking-[-0.06em] text-[var(--foreground)]">$5</span>
                <span className="pb-2 text-sm font-medium text-[var(--muted)]">/ month + applicable tax</span>
              </div>

              <ul className="mt-7 space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--foreground-soft)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)] text-xs font-bold text-[var(--success-text)]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button onClick={handleStartTrial} disabled={loading} className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Opening secure checkout…" : "Start your 7-day free trial"}
              </button>

              {error && <p className="mt-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</p>}

              <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">Your card is securely collected through Stripe. You will not be charged until your free trial ends.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-16 text-center">
          <h2 className="font-[family:var(--font-display)] text-3xl tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">Questions before you begin?</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Explore common questions about helpers, routines, billing, and cancellation.</p>
          <Link href="/help" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:bg-[var(--panel-soft)]">Visit help & FAQ</Link>
        </section>
      </div>
    </main>
  );
}