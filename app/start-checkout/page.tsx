"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

// Shown briefly right after a user confirms their email. Grabs the
// now-real session, kicks off a Stripe Checkout session, and redirects
// them straight into Stripe to start their 7-day trial.
export default function StartCheckoutPage() {
  const supabase = createBrowserClient();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function begin() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (!cancelled) {
          setError("We couldn't verify your session. Please log in again.");
        }
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

        if (url && !cancelled) {
          window.location.href = url;
          return;
        }

        if (!cancelled) {
          setError("Could not start checkout. Please try again.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Your email is confirmed, but we couldn't start checkout. Please try again or contact support."
          );
        }
      }
    }

    begin();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-neutral-200 text-center">
        {!error ? (
          <>
            <h1 className="text-xl font-semibold text-neutral-900">
              Setting up your trial...
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              You'll be redirected to checkout in a moment.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-neutral-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </>
        )}
      </div>
    </main>
  );
}