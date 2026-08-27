import Link from "next/link";

export function FooterLegalLinks() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
      <Link href="/legal#privacy-policy" className="hover:underline">
        Privacy Policy
      </Link>
      <span aria-hidden className="text-[var(--border-soft)]">
        |
      </span>
      <Link href="/legal#terms-of-use" className="hover:underline">
        Terms of Service
      </Link>
      <span aria-hidden className="text-[var(--border-soft)]">
        |
      </span>
      <a href="mailto:hello@kofelabs.com" className="hover:underline">
        Contact
      </a>
    </div>
  );
}