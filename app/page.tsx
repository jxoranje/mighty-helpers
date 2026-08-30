import Image from "next/image";
import Link from "next/link";
import logo from "@/app/components/images/logo.png";
import brushTeethIcon from "@/app/components/images/chores/brushed_teeth.png";
import makeBedIcon from "@/app/components/images/chores/make_bed.png";
import cleaningIcon from "@/app/components/images/chores/cleaning.png";
import setTableIcon from "@/app/components/images/chores/set_table.png";
import petsIcon from "@/app/components/images/chores/pets.png";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-it-matters", label: "Why it matters" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

const helperCards = [
  {
    name: "Maya",
    initial: "M",
    color: "bg-[rgba(255,243,218,0.96)] text-[rgb(140,96,35)]",
    task: "Brush Teeth",
    stars: 1,
    icon: brushTeethIcon,
    done: true,
  },
  {
    name: "Theo",
    initial: "T",
    color: "bg-[rgba(225,241,255,0.96)] text-[rgb(44,96,143)]",
    task: "Make Bed",
    stars: 1,
    icon: makeBedIcon,
    done: true,
  },
  {
    name: "Summer",
    initial: "S",
    color: "bg-[rgba(230,246,234,0.96)] text-[rgb(56,110,66)]",
    task: "Tidy Up",
    stars: 2,
    icon: cleaningIcon,
    done: false,
  },
];

const featureCards = [
  {
    number: "01",
    title: "Clear next steps",
    body: "Friendly icons and simple routines help every helper know what comes next.",
  },
  {
    number: "02",
    title: "Visible progress",
    body: "Stars, streaks, and rewards give everyday effort a satisfying sense of momentum.",
  },
  {
    number: "03",
    title: "A shared household rhythm",
    body: "Parents can shape routines, approve completed work, and celebrate contribution together.",
  },
];

const steps = [
  {
    number: "1",
    title: "Add your helpers",
    body: "Create a simple profile for each helper and make the household feel like theirs.",
  },
  {
    number: "2",
    title: "Build meaningful routines",
    body: "Choose illustrated chores, set star values, and adapt routines as your family grows.",
  },
  {
    number: "3",
    title: "Celebrate contribution",
    body: "Helpers complete tasks, grown-ups approve progress, and stars turn into rewards.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_12%_10%,_rgba(255,231,170,0.45),_transparent_31%),radial-gradient(circle_at_85%_12%,_rgba(242,192,218,0.42),_transparent_30%),radial-gradient(circle_at_58%_38%,_rgba(181,221,248,0.30),_transparent_34%)]" />

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm">
              <Image
                src={logo}
                alt="Mighty Helpers"
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight text-[var(--foreground)]">
                Mighty Helpers
              </span>
              <span className="mt-0.5 block text-xs font-medium text-[var(--muted)]">
                Helping habits, growing skills
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-white/70 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0 sm:px-5"
            >
              Start free trial
            </Link>
          </div>
        </header>

        <section className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-[var(--border-soft)] bg-white/72 px-4 py-2 text-sm font-semibold text-[var(--accent-strong)] shadow-sm backdrop-blur">
              A kinder way to build everyday routines
            </p>

            <h1 className="mt-6 max-w-3xl font-[family:var(--font-display)] text-5xl leading-[0.96] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Small helping hands.
              <br />
              Big life skills.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Mighty Helpers gives every helper a clear, encouraging way to take part at home—building confidence, practical skills, and family teamwork one everyday routine at a time.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,118,110,0.26)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0"
              >
                Start your 7-day free trial
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/78 px-6 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              $5/month plus applicable tax after your free trial. Cancel anytime.
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -left-10 top-8 h-36 w-36 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-60" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(40,72,120,0.12)] bg-[linear-gradient(145deg,_rgba(229,244,255,0.96),_rgba(240,250,244,0.98)_52%,_rgba(255,244,230,0.96))] p-4 shadow-[0_24px_60px_rgba(65,94,138,0.20)] sm:p-6">
              <div className="rounded-[1.55rem] border border-white/80 bg-white/82 p-5 shadow-sm backdrop-blur sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                      Today’s helpers
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      A few small wins
                    </h2>
                  </div>
                  <span className="rounded-full border border-[var(--star-border)] bg-[var(--star-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--star-text)]">
                    4 stars earned
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {helperCards.map((helper) => (
                    <div
                      key={helper.name}
                      className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-white/84 p-3 shadow-sm"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold ${helper.color}`}>
                        {helper.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {helper.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]">
                          <Image src={helper.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                          <span>{helper.task}</span>
                        </div>
                      </div>
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${helper.done ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "border border-[var(--border-strong)] bg-white text-[var(--muted)]"}`}>
                        {helper.done ? "✓" : ""}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,248,235,0.82)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-strong)]">Family streak</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">5 days</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(235,248,241,0.85)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-strong)]">Next reward</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Family movie night</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[1.4rem] border border-white/70 bg-white/60 px-4 py-3 text-sm text-[var(--foreground-soft)] backdrop-blur">
                <span className="inline-flex items-center gap-2"><Image src={setTableIcon} alt="" width={20} height={20} className="h-5 w-5 object-contain" /> Set the table is next</span>
                <span className="font-semibold text-[var(--accent-strong)]">2 stars</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="why-it-matters" className="border-y border-[var(--border-soft)] bg-white/56 px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-strong)]">Why it matters</p>
              <h2 className="mt-4 max-w-xl font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                Helping at home is about more than getting things done.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                Everyday routines can help every helper practice responsibility, confidence, and care for the people and spaces they share.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {featureCards.map((feature) => (
                <article key={feature.number} className="rounded-[1.65rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm">
                  <span className="text-sm font-semibold text-[var(--accent-strong)]">{feature.number}</span>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-[var(--foreground)]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-strong)]">How it works</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">A simple rhythm for your household.</h2>
            <p className="mt-5 text-base leading-8 text-[var(--muted)] sm:text-lg">Start with what works today, then shape routines as your helpers grow.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.number} className="relative rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-lg font-bold text-[var(--accent-strong)]">{step.number}</span>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
                {index < steps.length - 1 && <span className="pointer-events-none absolute right-[-1.75rem] top-12 hidden text-2xl text-[var(--muted)] lg:block">→</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[rgba(15,118,110,0.20)] bg-[linear-gradient(135deg,_rgba(219,245,239,0.94),_rgba(248,249,255,0.96)_50%,_rgba(255,242,218,0.92))] p-7 shadow-[0_20px_55px_rgba(40,90,90,0.12)] sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Ready when you are</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">Build a household where every helper can grow.</h2>
            <p className="mt-4 text-base leading-8 text-[var(--foreground-soft)]">Start your 7-day free trial today. One simple plan gives your whole household room to build helpful habits together.</p>
          </div>
          <div className="mt-7 shrink-0 lg:mt-0">
            <Link href="/sign-up" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]">Start your free trial</Link>
            <p className="mt-3 text-center text-xs text-[var(--muted)]">$5/month plus applicable tax after trial</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-soft)] bg-white/58 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white shadow-sm"><Image src={logo} alt="Mighty Helpers" width={36} height={36} className="h-full w-full object-cover" /></span>
            <p className="text-sm text-[var(--muted)]">© {new Date().getFullYear()} Mighty Helpers</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[var(--muted)]">
            <Link href="/pricing" className="hover:text-[var(--foreground)]">Pricing</Link>
            <Link href="/help" className="hover:text-[var(--foreground)]">Help</Link>
            <Link href="/legal" className="hover:text-[var(--foreground)]">Privacy & Terms</Link>
            <a href="https://www.kofelabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">Kofe Labs</a>
          </div>
        </div>
      </footer>
    </main>
  );
}