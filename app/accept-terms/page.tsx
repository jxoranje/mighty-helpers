"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

const TERMS_VERSION = "2026-08-26";

function getSafeNextPath(value: string | null) {
  if (!value) return "/onboarding";

  /*
   * Permit only same-site paths. This prevents an open redirect such as:
   * /accept-terms?next=https://malicious-example.com
   */
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/onboarding";
  }

  return value;
}

function AcceptTermsContent() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    let cancelled = false;

    async function loadConsentGate() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace(`/login?next=${encodeURIComponent("/accept-terms?next=" + nextPath)}`);
        return;
      }

      const { data: existingConsent, error: consentError } = await supabase
        .from("user_consents")
        .select("terms_accepted_at, terms_version")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (consentError) {
        setError(consentError.message);
        setLoading(false);
        return;
      }

      /*
       * If the person already accepted the current terms version,
       * do not make them accept again.
       */
      if (
        existingConsent?.terms_accepted_at &&
        existingConsent.terms_version === TERMS_VERSION
      ) {
        router.replace(nextPath);
        return;
      }

      setLoading(false);
    }

    loadConsentGate();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router, supabase]);

  async function acceptTerms() {
    setError("");

    if (!accepted) {
      setError("Please confirm that you have read and agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      router.replace(`/login?next=${encodeURIComponent("/accept-terms?next=" + nextPath)}`);
      return;
    }

    const { error: consentError } = await supabase
      .from("user_consents")
      .upsert(
        {
          user_id: user.id,
          terms_accepted_at: new Date().toISOString(),
          terms_version: TERMS_VERSION,
        },
        {
          onConflict: "user_id",
        }
      );

    if (consentError) {
      setSaving(false);
      setError(consentError.message);
      return;
    }

    /*
     * This is intentionally called only after consent was saved.
     * It returns the existing household or creates "My Household"
     * plus an owner membership for a new/recovered account.
     */
    const { data: householdResult, error: householdError } = await supabase
      .rpc("ensure_my_household")
      .single();

    if (householdError || !householdResult?.household_id) {
      console.error("Household setup failed after terms acceptance", {
        userId: user.id,
        error: householdError,
      });

      setSaving(false);
      setError(
        householdError?.message ||
          "Your terms were saved, but we could not finish setting up your household. Please try again."
      );
      return;
    }

    router.replace(nextPath);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-2xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">
              Checking your account…
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-2xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(33,53,85,0.12)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
              One last step
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Review and accept the terms
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Before setting up your Mighty Helpers household, please review our
              Privacy Policy and Terms of Service.
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
              <Link
                href="/legal"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--panel-soft)] active:translate-y-0"
              >
                Read Privacy Policy &amp; Terms of Service
              </Link>

              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Last updated August 26, 2026.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm leading-6 text-[var(--foreground)]">
                I confirm that I have read and agree to the Mighty Helpers{" "}
                <Link
                  href="/legal#terms-of-use"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--accent)] underline underline-offset-2"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal#privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--accent)] underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="mt-5 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm leading-6 text-[var(--danger-text)]">
                {error}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={acceptTerms}
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Accept and continue"}
              </button>

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
export default function AcceptTermsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-2xl items-center justify-center">
            <section className="w-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--muted)]">
                Preparing your account…
              </p>
            </section>
          </div>
        </main>
      }
    >
      <AcceptTermsContent />
    </Suspense>
  );
}