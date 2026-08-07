import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center">
        <section className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.55)_35%,_transparent_65%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-50" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl">
                  ★
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Mighty Helpers
                  </p>
                </div>
              </div>

            <div className="flex flex-col items-end gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                >
                Settings | Manage your household
              </Link>

            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-[var(--border-soft)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-soft-strong)] active:translate-y-0"
              >
              Log in to your household
          </Link>
        </div>
      </div>

            <div className="grid gap-8 pt-8 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-10">
              <div>
                <h1 className="mt-5 max-w-2xl font-[family:var(--font-display)] text-5xl leading-[0.95] tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl md:text-7xl">
                  Big chores.
                  <br />
                  Mighty Helpers.
                  <br />
                  Bright Stars.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Select your name, finish your chores, collect stars, and
                  cheer your way toward rewards.
                </p>

                <div className="mt-8 grid gap-4">
                  <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm backdrop-blur">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      How it works:
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                      <li>1. Check out your chores for today.</li>
                      <li>2. Finish your chores.</li>
                      <li>3. Hit "Done" in the app.</li>
                      <li>4. Earn stars for completed chores.</li>
                      <li>5. Save or use your stars for rewards!</li>
                    </ul>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--card-warm)] p-5 shadow-sm">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      For the grown-ups:
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Add your little ones, assign chores, approve completed tasks,
                      and manage your family's rewards right here in the household
                      dashboard.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-white/70 p-5 text-sm leading-6 text-[var(--muted)]">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Everyone in control!
                    </p>
                    Kids work in their own little sections. The adults stay in the
                    background until it’s time to set things up or approve a job
                    well done.
                  </div>
                </div>
              </div>

              <div className="md:pt-2">
                <Link
                  href="/kids"
                  className="group relative flex min-h-[320px] w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-[rgba(40,72,120,0.12)] bg-[linear-gradient(135deg,var(--kids-card-top),var(--kids-card-bottom))] px-7 py-7 text-left text-[var(--kids-text)] shadow-[0_18px_45px_rgba(72,86,156,0.22)] transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 sm:min-h-[360px] sm:px-9 sm:py-9"
                >
                  <div className="pointer-events-none absolute right-5 top-5 h-20 w-20 rounded-full bg-white/25 blur-2xl" />
                  <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 translate-x-6 translate-y-6 rounded-full bg-white/20 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                        <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 group-hover:translate-x-1">
                        Click Here To Start! →
                      </span>
                      <h2 className="mt-4 font-[family:var(--font-display)] text-4xl tracking-[-0.03em] sm:text-6xl">
                        Mighty Helpers!
                      </h2>
                    </div>
                  </div>

                  <div className="relative">
                    <p className="max-w-lg text-base leading-7 text-[var(--kids-text)]/90 sm:text-lg">
                      Select your name to see today’s chores, build your streak,
                      and earn stars for amazing rewards!
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--kids-text)]">
                      <span className="rounded-full bg-white/18 px-3 py-1.5">
                        Chores
                      </span>
                      <span className="rounded-full bg-white/18 px-3 py-1.5">
                        Stars
                      </span>
                      <span className="rounded-full bg-white/18 px-3 py-1.5">
                        Rewards
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-8 flex justify-center border-t border-[var(--border-soft)] pt-5">
              <a
                href="https://www.kofelabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium tracking-[0.18em] text-[var(--muted)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:text-[var(--foreground)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                Part of the Kofe Labs family
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}