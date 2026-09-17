"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import logo from "@/app/components/images/logo.png";

const TERMS_VERSION = "2026-08-26";

export default function SignUpPage() {
  const supabase = useMemo(() => createBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!agreedToTerms) {
      setError(
        "Please agree to the Privacy Policy and Terms of Service to continue."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          /*
           * Supabase sends the new parent here after they use the email
           * confirmation link. The callback creates the household setup,
           * stores consent, and directs the parent into onboarding.
           */
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            terms_accepted_at: new Date().toISOString(),
            terms_version: TERMS_VERSION,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error(
          "Something went wrong creating your account. Please try again."
        );
      }

      setSubmitted(true);
      setMessage(
        "Check your email—we sent a confirmation link. Open it to activate your account and begin setting up your household."
      );
    } catch (err: unknown) {
      console.error("Unable to create account:", err);

      setError(
        err instanceof Error
          ? err.message
          : "We could not create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center">
        <section className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.55)_35%,_transparent_65%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-50" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

          <div className="relative grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_0.95fr] md:p-10">
            <div className="flex flex-col justify-between">
              <div>
                <Link
                  href="/"
                  className="inline-flex rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
                  aria-label="Mighty Helpers home"
                >
                  <Image
                    src={logo}
                    alt="Mighty Helpers"
                    width={72}
                    height={72}
                    className="h-16 w-16 rounded-2xl object-cover shadow-sm sm:h-20 sm:w-20"
                    priority
                  />
                </Link>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                  Start your household
                </p>

                <h1 className="mt-3 max-w-md font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Start building a routine that works for your family.
                </h1>

                <p className="mt-4 max-w-md text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Create your parent account, add your helpers, and set up
                  chores and rewards your family can use together.
                </p>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/75 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Built for shared family devices
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Helpers do not need an email address or password. Parents and
                  guardians use this account to manage chores, stars, and
                  rewards.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/82 p-6 shadow-sm backdrop-blur sm:p-7">
              {!submitted ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                    Create your account
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Your family’s Mighty Helpers account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    You will confirm your email before you begin setting up
                    your household.
                  </p>

                  <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                      >
                        Email
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                      >
                        Password
                      </label>

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                      />

                      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                        Use at least 8 characters.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-[var(--border-soft)] bg-[var(--background)]/65 p-4 transition-colors hover:bg-white">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={agreedToTerms}
                        onChange={(event) =>
                          setAgreedToTerms(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border-strong)] accent-[var(--accent)]"
                      />

                      <span className="text-sm leading-6 text-[var(--muted)]">
                        I have read and agree to the Mighty Helpers{" "}
                        <Link
                          href="/legal#terms-of-use"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[var(--accent)] underline underline-offset-4"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/legal#privacy-policy"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[var(--accent)] underline underline-offset-4"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading || !agreedToTerms}
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-[1rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Creating your account…" : "Create account"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-2xl">
                    ✉️
                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                    Check your inbox
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Confirm your email to continue
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    {message}
                  </p>

                  <div className="mt-6 rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--background)]/65 p-4">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Cannot find the email?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Check your spam or promotions folder. The message is sent
                      to <span className="font-medium">{email}</span>.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/login"
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                    >
                      Go to login
                    </Link>

                    <Link
                      href="/"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
                    >
                      Back to home
                    </Link>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="mt-4 rounded-[1rem] border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {!submitted && (
                <p className="mt-6 text-sm text-[var(--muted)]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[var(--foreground)] underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
                  >
                    Log in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}