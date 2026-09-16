import Image from "next/image";
import Link from "next/link";
import logo from "@/app/components/images/logo.png";

const FEATURES = [
  {
    title: "Choose a helper",
    body: "Kids choose their name on a simple shared-device screen and see the chores that belong to them.",
    icon: "🪥",
    iconBg: "bg-[var(--star-soft)]",
  },
  {
    title: "Complete chores",
    body: "Helpers mark chores complete and earn stars right away—no waiting for a grown-up to confirm the task.",
    icon: "⭐",
    iconBg: "bg-[var(--accent-soft)]",
  },
  {
    title: "Work toward rewards",
    body: "Parents create rewards that fit their family, and kids redeem the stars they have earned.",
    icon: "🎁",
    iconBg: "bg-[rgba(164,140,255,0.14)]",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Set up your household",
    body: "Add your helpers, choose a household name, and begin with a few starter chores.",
  },
  {
    number: "2",
    title: "Make expectations clear",
    body: "Create chores, decide how many stars they are worth, and organize a routine that fits your family.",
  },
  {
    number: "3",
    title: "Let progress add up",
    body: "Kids select themselves, complete chores, earn stars, and work toward rewards you choose.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Mighty Helpers home"
        >
          <Image
            src={logo}
            alt=""
            width={44}
            height={44}
            className="h-10 w-10 rounded-2xl object-cover shadow-sm sm:h-11 sm:w-11"
            priority
          />

          <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Mighty Helpers
          </span>
        </Link>

        <nav className="flex items-center gap-2" aria-label="Public navigation">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
          >
            Log in
          </Link>

          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto mt-4 max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-14 shadow-[0_20px_60px_rgba(33,53,85,0.12)] sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.55)_35%,_transparent_65%)]" />
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-50" />
        <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] shadow-sm">
            Less reminding. More responsibility.
          </p>

          <h1 className="mt-6 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">
            A chore routine your kids can actually use
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Mighty Helpers gives every child a clear next task, turns completed
            chores into stars, and helps your family build routines that feel
            simpler, more consistent, and more encouraging.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
            >
              Start your 7-day free trial
            </Link>

            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-6 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
            >
              Already a member? Log in
            </Link>
          </div>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Set up your household, add helpers, and try Mighty Helpers free for
            7 days.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
            How it works
          </p>

          <h2 className="mt-3 font-[family:var(--font-display)] text-3xl tracking-[-0.035em] text-[var(--foreground)] sm:text-4xl">
            A simple loop for the whole family
          </h2>

          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Parents set the structure once. Helpers can see what comes next,
            make progress, and celebrate the rewards they earn.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-6 shadow-sm"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl ${feature.iconBg}`}
              >
                {feature.icon}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(33,53,85,0.08)] sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
              Built for real households
            </p>

            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl tracking-[-0.035em] text-[var(--foreground)] sm:text-4xl">
              Start small, then make the routine your own
            </h2>

            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Mighty Helpers is designed for shared family devices. Children do
              not need an email address or a password—just select their helper
              profile and get started.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <article
                key={step.number}
                className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/75 p-5"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-strong)]">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--accent-soft)] px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Ready when you are
          </p>

          <h2 className="mt-3 font-[family:var(--font-display)] text-3xl tracking-[-0.035em] text-[var(--foreground)] sm:text-4xl">
            Make chores clearer—and progress more visible.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
            Create a household, set up your first helper, and see whether
            Mighty Helpers is a fit for your family.
          </p>

          <Link
            href="/pricing"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
          >
            See pricing &amp; start free trial
          </Link>
        </div>
      </section>

      <footer className="mx-auto mt-14 max-w-6xl border-t border-[var(--border-soft)] px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-medium text-[var(--muted-strong)]">
            Mighty Helpers · Kofe Labs
          </span>

          <div className="flex items-center gap-5 text-sm text-[var(--muted)]">
            <Link href="/pricing" className="hover:text-[var(--foreground)]">
              Pricing
            </Link>

            <Link href="/legal" className="hover:text-[var(--foreground)]">
              Privacy &amp; Terms
            </Link>

            <Link href="/login" className="hover:text-[var(--foreground)]">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}