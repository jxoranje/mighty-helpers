import Image from "next/image";
import Link from "next/link";
import logo from "@/app/components/images/logo.png";

const faqs = [
  {
    question: "What is Mighty Helpers?",
    answer: "Mighty Helpers is a family routine app that gives every helper a clear, encouraging way to contribute at home. Families can create chores, recognize progress with stars, and build toward rewards together.",
  },
  {
    question: "Do helpers need email addresses?",
    answer: "No. A grown-up creates and manages helper profiles. Helpers can use the kid-friendly screen without their own email address or individual login.",
  },
  {
    question: "Can I add more than one helper?",
    answer: "Yes. Add as many helpers as your household needs, then give each person routines, chores, stars, and rewards that make sense for them.",
  },
  {
    question: "Can I change chores later?",
    answer: "Absolutely. Routines change. You can add, edit, pause, or remove chores whenever your household needs something different.",
  },
  {
    question: "How do stars and rewards work?",
    answer: "Grown-ups choose star values for chores. When a helper completes a chore and it is approved, they earn stars that can be saved or used toward household rewards.",
  },
  {
    question: "What happens during the free trial?",
    answer: "Your household has full access for seven days. Stripe securely collects your payment method at trial start, but you are not charged until the trial ends.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. You can cancel from your household settings. Your access continues through the end of the current billing period, and the subscription will not renew after that.",
  },
  {
    question: "How much does Mighty Helpers cost?",
    answer: "Mighty Helpers is $5 per month plus applicable tax for one household. The plan includes all helpers, routines, chores, stars, rewards, and parent management tools.",
  },
  {
    question: "What makes a good chore for a helper?",
    answer: "The best chores are clear, age-appropriate, and connected to real family life. Start small, make the next step obvious, and celebrate effort as helpers practice new skills.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm"><Image src={logo} alt="Mighty Helpers" width={44} height={44} className="h-full w-full object-cover" priority /></span>
            <span className="text-base font-semibold tracking-tight text-[var(--foreground)]">Mighty Helpers</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] sm:inline-flex">Pricing</Link>
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:bg-white">Log in</Link>
          </div>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.56)_35%,_transparent_68%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-45" />

          <div className="relative p-6 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">Help & FAQ</p>
              <h1 className="mt-6 font-[family:var(--font-display)] text-5xl leading-[0.96] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">A little help for every helpful habit.</h1>
              <p className="mt-6 text-base leading-8 text-[var(--muted)] sm:text-lg">Find answers about setting up your household, supporting your helpers, and managing your Mighty Helpers plan.</p>
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-[1.45rem] border border-[var(--border-soft)] bg-white/78 p-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[var(--foreground)] marker:hidden">
                    {faq.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-lg font-medium text-[var(--muted)] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-3xl rounded-[1.65rem] border border-[var(--border-soft)] bg-[rgba(245,251,248,0.86)] p-6 text-center shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Still need a hand?</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">For account, billing, or household questions that are not covered here, contact the Mighty Helpers team.</p>
              <a href="mailto:support@kofelabs.com?subject=Mighty%20Helpers%20Support" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)] hover:bg-[var(--accent-hover)]">Email support</a>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mighty Helpers</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
            <Link href="/pricing" className="hover:text-[var(--foreground)]">Pricing</Link>
            <Link href="/legal" className="hover:text-[var(--foreground)]">Privacy & Terms</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}