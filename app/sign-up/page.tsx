"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Where Supabase sends the user after they click the confirmation
        // link in their email. This route exchanges the code for a session,
        // then kicks off Stripe Checkout.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user) {
      setError("Something went wrong creating your account. Please try again.");
      return;
    }

    setSubmitted(true);
    setMessage(
      "Check your email — we sent a confirmation link. Click it to activate your account and start your free trial."
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900">Sign up</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Create your Mighty Helpers account.
        </p>

        {!submitted && (
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-600" role="status">
            {message}
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {!submitted && (
          <p className="mt-6 text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login" className="text-neutral-900 underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}