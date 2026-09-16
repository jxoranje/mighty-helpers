"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import logo from "@/app/components/images/logo.png";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/kids", label: "Select Helpers" },
  { href: "/chores", label: "Chores" },
  { href: "/rewards", label: "Rewards" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Mighty Helpers"
            width={32}
            height={32}
            className="h-8 w-8 rounded-xl object-cover shadow-sm"
            priority
          />
          <span className="hidden text-sm font-semibold text-[var(--foreground)] sm:inline">
            Mighty Helpers
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

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
            onClick={handleSignOut}
            className="rounded-full border border-[var(--danger-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-soft)]"
          >
            Log Out
          </button>
        </nav>
      </div>
    </header>
  );
}