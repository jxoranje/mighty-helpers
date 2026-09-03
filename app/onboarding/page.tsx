"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  CHORE_CATEGORY_LIST,
  type ChoreCategoryKey,
} from "@/lib/chore-categories";
import { getKidAvatar } from "@/lib/kid-avatar";
import logo from "@/app/components/images/logo.png";

type Household = {
  id: string;
  name: string;
  onboarding_completed_at: string | null;
};

type Kid = {
  id: string;
  household_id: string;
  name: string;
  avatar: string | null;
  stars: number | null;
  level: number | null;
  streak_days: number | null;
};

type StarterChore = {
  id: string;
  title: string;
  description: string;
  starValue: number;
  recurrenceType: "daily" | "weekly";
  category: ChoreCategoryKey;
};

type EnsureHouseholdResult = {
  household_id: string;
  created: boolean;
};

const STARTER_CHORES: StarterChore[] = [
  {
    id: "brush-teeth",
    title: "Brush Teeth",
    description: "Brush for two minutes before bed.",
    starValue: 1,
    recurrenceType: "daily",
    category: "brushed_teeth",
  },
  {
    id: "make-bed",
    title: "Make Bed",
    description: "Make the bed before starting the day.",
    starValue: 1,
    recurrenceType: "daily",
    category: "make_bed",
  },
  {
    id: "tidy-up",
    title: "Tidy Up",
    description: "Put toys, clothes, or supplies back in their place.",
    starValue: 2,
    recurrenceType: "daily",
    category: "cleaning",
  },
  {
    id: "set-table",
    title: "Set the Table",
    description: "Help get the table ready for a meal.",
    starValue: 2,
    recurrenceType: "daily",
    category: "set_table",
  },
  {
    id: "homework",
    title: "Homework Time",
    description: "Complete homework or reading time.",
    starValue: 3,
    recurrenceType: "daily",
    category: "homework",
  },
  {
    id: "feed-pets",
    title: "Feed Pets",
    description: "Help make sure pets have food and water.",
    starValue: 2,
    recurrenceType: "daily",
    category: "pets",
  },
  {
    id: "walk-dog",
    title: "Walk the Dog",
    description: "Help with the family dog walk.",
    starValue: 3,
    recurrenceType: "daily",
    category: "walk_dog",
  },
  {
    id: "laundry",
    title: "Put Away Laundry",
    description: "Fold or put clean clothes away.",
    starValue: 2,
    recurrenceType: "weekly",
    category: "laundry",
  },
];

function getCategory(key: ChoreCategoryKey) {
  return CHORE_CATEGORY_LIST.find((category) => category.key === key);
}

function StepPill({
  active,
  complete,
  number,
  label,
}: {
  active: boolean;
  complete: boolean;
  number: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-[var(--accent)] text-white shadow-[0_6px_16px_rgba(15,118,110,0.25)]"
            : complete
              ? "bg-[var(--success-soft)] text-[var(--success-text)]"
              : "bg-[var(--panel-soft)] text-[var(--muted)]"
        }`}
      >
        {complete ? "✓" : number}
      </span>
      <span
        className={`text-xs font-semibold ${
          active ? "text-[var(--foreground)]" : "text-[var(--muted)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [step, setStep] = useState(1);
  const [household, setHousehold] = useState<Household | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);

  const [householdName, setHouseholdName] = useState("");
  const [newKidName, setNewKidName] = useState("");
  const [newKidInitial, setNewKidInitial] = useState("");

  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([
    "brush-teeth",
    "make-bed",
    "tidy-up",
  ]);
  const [templateKidId, setTemplateKidId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOnboarding() {
      setLoading(true);
      setError("");
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      /*
       * Consent must be checked before household recovery.
       * The ensure_my_household() SQL function should enforce this too,
       * but this redirect provides the correct user experience.
       */
      const { data: consent, error: consentError } = await supabase
        .from("user_consents")
        .select("terms_accepted_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (consentError) {
        setError(consentError.message);
        setLoading(false);
        return;
      }

      if (!consent?.terms_accepted_at) {
        router.replace("/accept-terms?next=/onboarding");
        return;
      }

      /*
       * Self-healing setup:
       * - Returns the existing household for a user who already has one.
       * - Creates "My Household" plus an owner membership if missing.
       */
      const { data: householdResult, error: recoveryError } = await supabase
        .rpc("ensure_my_household")
        .single();

      if (cancelled) return;

      const recoveredHousehold = householdResult as EnsureHouseholdResult | null;
      const householdId = recoveredHousehold?.household_id;

      if (recoveryError || !householdId) {
        console.error("Household recovery failed", {
          userId: user.id,
          error: recoveryError,
        });

        setError(
          recoveryError?.message ||
            "We could not complete your household setup. Please try again."
        );
        setLoading(false);
        return;
      }

      const { data: householdRow, error: householdError } = await supabase
        .from("households")
        .select("id, name, onboarding_completed_at")
        .eq("id", householdId)
        .single();

      if (cancelled) return;

      if (householdError || !householdRow) {
        setError(
          householdError?.message ||
            "Your household was created but could not be loaded. Please try again."
        );
        setLoading(false);
        return;
      }

      const typedHousehold = householdRow as Household;

      if (typedHousehold.onboarding_completed_at) {
        router.replace("/dashboard");
        return;
      }

      const { data: kidRows, error: kidsError } = await supabase
        .from("kids")
        .select("id, household_id, name, avatar, stars, level, streak_days")
        .eq("household_id", typedHousehold.id)
        .is("archived_at", null)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (kidsError) {
        setError(kidsError.message);
        setLoading(false);
        return;
      }

      const loadedKids = (kidRows as Kid[]) || [];

      setHousehold(typedHousehold);
      setHouseholdName(typedHousehold.name);
      setKids(loadedKids);

      if (loadedKids.length > 0) {
        setTemplateKidId(loadedKids[0].id);
      }

      setLoading(false);
    }

    loadOnboarding();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function saveHouseholdName() {
    if (!household) return;

    const trimmedName = householdName.trim();

    if (!trimmedName) {
      setError("Please give your household a name.");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    const { data, error: updateError } = await supabase
      .from("households")
      .update({ name: trimmedName } as never)
      .eq("id", household.id)
      .select("id, name, onboarding_completed_at")
      .single();

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const updatedHousehold = data as Household;
    setHousehold(updatedHousehold);
    setHouseholdName(updatedHousehold.name);
    setStep(2);
  }

  async function addKid() {
    if (!household) return;

    const trimmedName = newKidName.trim();
    const initial = newKidInitial.trim().slice(0, 1).toUpperCase();

    if (!trimmedName) {
      setError("Please enter your child’s name.");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    const { data, error: insertError } = await supabase
      .from("kids")
      .insert({
        household_id: household.id,
        name: trimmedName,
        avatar: initial || null,
      } as never)
      .select("id, household_id, name, avatar, stars, level, streak_days")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    const newKid = data as Kid;
    setKids((previous) => [...previous, newKid]);
    setTemplateKidId((current) => current || newKid.id);
    setNewKidName("");
    setNewKidInitial("");
    setMessage(`${newKid.name} is ready to help!`);
  }

  function continueFromKids() {
    if (kids.length === 0) {
      setError("Add at least one child before continuing.");
      return;
    }

    if (!templateKidId) {
      setTemplateKidId(kids[0].id);
    }

    setError("");
    setMessage("");
    setStep(3);
  }

  function toggleTemplate(templateId: string) {
    setSelectedTemplateIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId]
    );
  }

  async function saveStarterChores() {
    if (!household) return;

    if (!templateKidId) {
      setError("Choose which child should receive the starter chores.");
      return;
    }

    const selectedTemplates = STARTER_CHORES.filter((template) =>
      selectedTemplateIds.includes(template.id)
    );

    setError("");
    setMessage("");
    setSaving(true);

    if (selectedTemplates.length > 0) {
      const { error: upsertError } = await supabase.from("chores").upsert(
        selectedTemplates.map((template) => ({
          household_id: household.id,
          kid_id: templateKidId,
          title: template.title,
          description: template.description,
          star_value: template.starValue,
          category: template.category,
          recurrence_type: template.recurrenceType,
          is_active: true,
          onboarding_template_key: template.id,
        })) as never,
        {
          onConflict: "household_id,kid_id,onboarding_template_key",
          ignoreDuplicates: true,
        }
      );

      if (upsertError) {
        setSaving(false);
        setError(upsertError.message);
        return;
      }
    }

    setSaving(false);
    setStep(4);
  }

  async function startTrial() {
    setError("");
    setMessage("");
    setStartingTrial(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      if (!payload.url) {
        throw new Error("Checkout did not return a valid URL.");
      }

      window.location.assign(payload.url);
    } catch (err: unknown) {
      const text =
        err instanceof Error
          ? err.message
          : "Unable to start checkout. Please try again.";

      setError(text);
      setStartingTrial(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">
              Preparing your Mighty Helpers setup…
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (error && !household) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-[var(--danger-border)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              We couldn’t finish setting up your household
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--danger-text)]">
              {error}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Please refresh and try again. If this continues, contact support
              and include code: HOUSEHOLD_SETUP_FAILED.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                Try again
              </button>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                Back to login
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const selectedCount = selectedTemplateIds.length;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.56)_35%,_transparent_68%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-5 border-b border-[var(--border-soft)] pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={logo}
                  alt="Mighty Helpers"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-2xl object-cover shadow-sm sm:h-16 sm:w-16"
                  priority
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-strong)]">
                    Getting started
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    Welcome to Mighty Helpers
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <StepPill active={step === 1} complete={step > 1} number={1} label="Home" />
                <StepPill active={step === 2} complete={step > 2} number={2} label="Helpers" />
                <StepPill active={step === 3} complete={step > 3} number={3} label="Chores" />
                <StepPill active={step === 4} complete={false} number={4} label="Trial" />
              </div>
            </div>

            {(error || message) && (
              <div className="mt-6 space-y-3">
                {error && (
                  <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
                    {message}
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <section className="mx-auto max-w-2xl py-10 sm:py-14">
                <p className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
                  Step 1 of 4
                </p>
                <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Let’s make your household feel like home.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Start with a household name. You can change it any time from your settings.
                </p>

                <div className="mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/76 p-5 shadow-sm backdrop-blur sm:p-6">
                  <label
                    htmlFor="household-name"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
                  >
                    Household name
                  </label>
                  <input
                    id="household-name"
                    value={householdName}
                    onChange={(event) => setHouseholdName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveHouseholdName();
                      }
                    }}
                    placeholder="The Johnson Family"
                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveHouseholdName}
                  disabled={saving}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Continue"}
                </button>
              </section>
            )}

            {step === 2 && (
              <section className="mx-auto max-w-3xl py-8 sm:py-12">
                <p className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
                  Step 2 of 4
                </p>
                <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Add your first helper.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Add at least one child to begin. You can add siblings now or any time later.
                </p>

                <div className="mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/76 p-5 shadow-sm backdrop-blur sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-[1fr_130px_auto] sm:items-end">
                    <div>
                      <label
                        htmlFor="kid-name"
                        className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
                      >
                        Child’s name
                      </label>
                      <input
                        id="kid-name"
                        value={newKidName}
                        onChange={(event) => {
                          const name = event.target.value;
                          setNewKidName(name);

                          if (!newKidInitial) {
                            setNewKidInitial(name.trim().slice(0, 1).toUpperCase());
                          }
                        }}
                        placeholder="Maya"
                        className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="kid-initial"
                        className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
                      >
                        Initial
                      </label>
                      <input
                        id="kid-initial"
                        value={newKidInitial}
                        maxLength={1}
                        onChange={(event) =>
                          setNewKidInitial(event.target.value.toUpperCase())
                        }
                        placeholder={newKidName.trim().slice(0, 1).toUpperCase() || "M"}
                        className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addKid}
                      disabled={saving}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add helper
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {kids.map((kid, index) => {
                    const colors = [
                      "bg-[rgba(255,243,218,0.92)] text-[rgb(140,96,35)]",
                      "bg-[rgba(225,241,255,0.92)] text-[rgb(44,96,143)]",
                      "bg-[rgba(230,246,234,0.92)] text-[rgb(56,110,66)]",
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <article
                        key={kid.id}
                        className="flex items-center gap-4 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/78 p-4 shadow-sm"
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${color}`}
                        >
                          {getKidAvatar(kid.name, kid.avatar)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-[var(--foreground)]">
                            {kid.name}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Ready to become a Mighty Helper.
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {kids.length === 0 && (
                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] px-5 py-6 text-sm text-[var(--muted)]">
                    Add your first child above to continue.
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={saving}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={continueFromKids}
                    disabled={saving || kids.length === 0}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue to chores
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="mx-auto max-w-4xl py-8 sm:py-12">
                <p className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
                  Step 3 of 4
                </p>
                <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Start with a few small wins.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  These optional starter chores make the app useful immediately. Pick any that fit your routine—you can edit or remove them later.
                </p>

                <div className="mt-7 max-w-md">
                  <label
                    htmlFor="starter-chore-kid"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
                  >
                    Add these chores for
                  </label>
                  <select
                    id="starter-chore-kid"
                    value={templateKidId}
                    onChange={(event) => setTemplateKidId(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
                  >
                    {kids.map((kid) => (
                      <option key={kid.id} value={kid.id}>
                        {kid.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {STARTER_CHORES.map((template) => {
                    const category = getCategory(template.category);
                    const selected = selectedTemplateIds.includes(template.id);

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => toggleTemplate(template.id)}
                        aria-pressed={selected}
                        className={`group rounded-[1.5rem] border p-4 text-left transition-all duration-200 ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_10px_25px_rgba(15,118,110,0.10)]"
                            : "border-[var(--border-soft)] bg-white/78 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm">
                            {category && (
                              <Image
                                src={category.icon}
                                alt=""
                                width={30}
                                height={30}
                                className="h-7 w-7 object-contain"
                              />
                            )}
                          </div>
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                              selected
                                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                                : "border-[var(--border-strong)] bg-white text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                          {template.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {template.starValue}{" "}
                          {template.starValue === 1 ? "star" : "stars"} ·{" "}
                          {template.recurrenceType}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-sm text-[var(--muted)]">
                  {selectedCount === 0
                    ? "No problem—you can begin with a blank chore list."
                    : `${selectedCount} starter ${
                        selectedCount === 1 ? "chore" : "chores"
                      } selected.`}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={saving}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={saveStarterChores}
                    disabled={saving}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Continue to your trial"}
                  </button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="mx-auto max-w-2xl py-10 text-center sm:py-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[var(--accent-soft)] text-3xl shadow-sm">
                  ✨
                </div>
                <p className="mt-6 inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
                  Step 4 of 4
                </p>
                <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                  Your household is ready to grow.
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Start your 7-day free trial to unlock your Mighty Helpers dashboard.
                  Stripe securely collects your payment details now; you will not
                  be charged until the trial ends.
                </p>

                <div className="mt-8 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/78 p-5 text-left shadow-sm">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Your setup includes
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
                    <li>
                      • {kids.length} {kids.length === 1 ? "helper" : "helpers"} ready to go
                    </li>
                    <li>
                      • {selectedCount} starter{" "}
                      {selectedCount === 1 ? "chore" : "chores"} selected
                    </li>
                    <li>
                      • A clear place to approve tasks, award stars, and manage rewards
                    </li>
                  </ul>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={saving || startingTrial}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={startTrial}
                    disabled={saving || startingTrial}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {startingTrial ? "Opening secure checkout…" : "Start my 7-day free trial"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}