"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

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
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      if (!res.ok) throw new Error("Checkout request failed");

      const { url } = await res.json();

      if (url) {
        window.location.href = url;
        return;
      }

      setError("Could not start checkout. Please try again.");
    } catch (err) {
      setError("Something went wrong starting checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-neutral-200 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Start your free trial
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          7 days free, then billed automatically. Cancel anytime before the
          trial ends and you won't be charged.
        </p>

        <button
          onClick={handleStartTrial}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Redirecting to checkout..." : "Start 7-day free trial"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <p className="mt-6 text-sm text-neutral-600">
          <Link href="/login" className="text-neutral-900 underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
