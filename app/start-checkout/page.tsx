"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StartCheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
        <h1 className="text-xl font-semibold">Preparing your household…</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Taking you to your Mighty Helpers setup.
        </p>
      </div>
    </main>
  );
}