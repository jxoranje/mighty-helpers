"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import logo from "@/app/components/images/logo.png";

const NAV_ITEMS = [
  { href: "/kids", label: "Select Helpers" },
  { href: "/dashboard", label: "Parent Dashboard" },
  { href: "/chores", label: "Chores" },
  { href: "/rewards", label: "Rewards" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Unable to sign out:", error);
      }

      router.replace("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/kids"
          className="flex shrink-0 items-center gap-2"
          aria-label="Go to Mighty Helpers dashboard"
        >
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-xl object-cover shadow-sm"
            priority
          />

          <span className="hidden text-sm font-semibold text-[var(--foreground)] sm:inline">
            Mighty Helpers
          </span>
        </Link>

        <nav
          className="flex flex-wrap items-center justify-end gap-1 sm:gap-2"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="rounded-full border border-[var(--danger-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        </nav>
      </div>
    </header>
  );
}