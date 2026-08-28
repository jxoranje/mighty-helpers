"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import logo from "@/app/components/images/logo.png";

export default function LoginPage() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

      setMessage("Login successful.");
      window.location.href = "/";
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
                <Image
                  src={logo}
                  alt="Mighty Helpers"
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-2xl object-cover shadow-sm sm:h-20 sm:w-20"
                  priority
                />

                <h1 className="mt-5 max-w-md font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Log in to manage your household
                </h1>

                <p className="mt-4 max-w-md text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Sign in to add kids, adjust chores, approve completed tasks,
                  and manage rewards.
                </p>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/75 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Adults only
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Kids can keep using the kid picker. Parents can log in here
                  whenever it’s time to make updates.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/82 p-6 shadow-sm backdrop-blur sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                Welcome back
              </p>

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-[1rem] border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-[1rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
                >
                  Log in
                </button>
              </form>

              {message && (
                <p className="mt-4 rounded-[1rem] border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
                  {message}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-[1rem] border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/"
                  className="text-sm font-medium text-[var(--muted)] underline-offset-4 transition-colors duration-200 hover:text-[var(--foreground)] hover:underline"
                >
                  Back to home
                </Link>

                <p className="text-sm text-[var(--muted)]">
                  Need an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-medium text-[var(--foreground)] underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}