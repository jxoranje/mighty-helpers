"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { CHORE_CATEGORY_LIST } from "@/lib/chore-categories";
import AppNav from "@/app/components/AppNav";

type RecurrenceType = "one_off" | "daily" | "weekly" | "biweekly";

type KidColor = "blue" | "orange" | "green" | "purple" | "pink" | "yellow";

type KidRow = {
  id: string;
  name: string;
  household_id: string;
  stars: number | null;
  level: number | null;
  color: KidColor | null;
};

type ChoreRelation =
  | {
      title?: string;
      recurrence_type?: RecurrenceType;
      star_value?: number | null;
      category?: string | null;
    }
  | {
      title?: string;
      recurrence_type?: RecurrenceType;
      star_value?: number | null;
      category?: string | null;
    }[]
  | null;

type AssignmentRow = {
  id: string;
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  chores: ChoreRelation;
};

type ChoreRow = {
  id: string;
  household_id: string;
  kid_id: string | null;
  title: string;
  recurrence_type: RecurrenceType;
  star_value: number | null;
  category: string | null;
  is_active: boolean;
};

type KidChoreItem = {
  id: string;
  source: "assignment" | "recurring";
  chore_id: string;
  title: string;
  recurrence_type: RecurrenceType | null;
  status: "assigned" | "completed" | "recurring";
  assigned_for_date: string | null;
  star_value: number;
  category: string | null;
};

type CompleteKidChoreResult = {
  assignment_id: string;
  assignment_status: string;
  kid_id: string;
  stars: number;
  stars_earned: number;
  assigned_for_date: string | null;
};

type HeroStyle = {
  background: string;
  text: string;
  softText: string;
  chip: string;
  button: string;
};

const HERO_STYLES: Record<KidColor, HeroStyle> = {
  blue: {
    background: "bg-[linear-gradient(135deg,#8fd0ff_0%,#7a84ff_100%)]",
    text: "text-white",
    softText: "text-white/85",
    chip: "bg-white/18 text-white",
    button: "bg-white text-[#5160bf] hover:bg-white/90",
  },
  orange: {
    background: "bg-[linear-gradient(135deg,#ffdca8_0%,#ffb8a6_100%)]",
    text: "text-[#5d3d2e]",
    softText: "text-[#704c3d]",
    chip: "bg-white/55 text-[#6b4839]",
    button: "bg-white text-[#a75f4a] hover:bg-white/90",
  },
  green: {
    background: "bg-[linear-gradient(135deg,#c7f1c9_0%,#8edfc3_100%)]",
    text: "text-[#1f4d44]",
    softText: "text-[#35665a]",
    chip: "bg-white/55 text-[#27584c]",
    button: "bg-white text-[#167b70] hover:bg-white/90",
  },
  purple: {
    background: "bg-[linear-gradient(135deg,#d9c8ff_0%,#b79bff_100%)]",
    text: "text-white",
    softText: "text-white/85",
    chip: "bg-white/18 text-white",
    button: "bg-white text-[#7457bf] hover:bg-white/90",
  },
  pink: {
    background: "bg-[linear-gradient(135deg,#ffc9e3_0%,#ff9fc0_100%)]",
    text: "text-[#6b2d4a]",
    softText: "text-[#81425d]",
    chip: "bg-white/55 text-[#7a3a56]",
    button: "bg-white text-[#b34870] hover:bg-white/90",
  },
  yellow: {
    background: "bg-[linear-gradient(135deg,#fff0a8_0%,#ffd76a_100%)]",
    text: "text-[#5d4a10]",
    softText: "text-[#705d1f]",
    chip: "bg-white/55 text-[#6b551a]",
    button: "bg-white text-[#927116] hover:bg-white/90",
  },
};

const FALLBACK_COLOR_ORDER: KidColor[] = [
  "blue",
  "orange",
  "green",
  "purple",
  "pink",
  "yellow",
];

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getChoreField(
  relation: ChoreRelation,
  field: "title" | "recurrence_type" | "star_value" | "category"
) {
  if (!relation) {
    return null;
  }

  const record = Array.isArray(relation) ? relation[0] : relation;
  const value = record?.[field];

  if (field === "star_value") {
    return typeof value === "number" ? value : 0;
  }

  return typeof value === "string" ? value : "";
}

function normalizeAssignment(row: AssignmentRow): KidChoreItem {
  const recurrenceType = getChoreField(
    row.chores,
    "recurrence_type"
  ) as RecurrenceType | "";

  return {
    id: row.id,
    source: "assignment",
    chore_id: row.chore_id,
    title: (getChoreField(row.chores, "title") as string) || "Chore",
    recurrence_type: recurrenceType || null,
    status: row.status === "approved" ? "completed" : "assigned",
    assigned_for_date: row.assigned_for_date,
    star_value: (getChoreField(row.chores, "star_value") as number) || 0,
    category: (getChoreField(row.chores, "category") as string) || null,
  };
}

function normalizeRecurringChore(row: ChoreRow): KidChoreItem {
  return {
    id: `recurring-${row.id}`,
    source: "recurring",
    chore_id: row.id,
    title: row.title,
    recurrence_type: row.recurrence_type,
    status: "recurring",
    assigned_for_date: null,
    star_value: row.star_value ?? 0,
    category: row.category,
  };
}

function StarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.8l2.63 5.33 5.88.86-4.26 4.15 1.01 5.86L12 16.23 6.74 19l1.01-5.86-4.26-4.15 5.88-.86L12 2.8z" />
    </svg>
  );
}

function getChoreIcon(category: string | null) {
  if (!category) {
    return null;
  }

  return CHORE_CATEGORY_LIST.find((item) => item.key === category) ?? null;
}

function getHeroStyle(kid: KidRow): HeroStyle {
  if (kid.color) {
    return HERO_STYLES[kid.color];
  }

  const nameValue = kid.name
    .trim()
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  const color =
    FALLBACK_COLOR_ORDER[nameValue % FALLBACK_COLOR_ORDER.length];

  return HERO_STYLES[color];
}

export default function KidChoresPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const params = useParams<{ id: string }>();
  const kidId = params.id;

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [kid, setKid] = useState<KidRow | null>(null);
  const [choreItems, setChoreItems] = useState<KidChoreItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [completionErrors, setCompletionErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadKidChores() {
      setLoading(true);
      setPageError("");
      setMessage("");
      setCompletionErrors({});

      try {
        if (!kidId) {
          throw new Error("No helper selected.");
        }

        const { data: kidRow, error: kidError } = await supabase
          .from("kids")
          .select("id, name, household_id, stars, level, color")
          .eq("id", kidId)
          .maybeSingle();

        if (cancelled) return;

        if (kidError) {
          throw kidError;
        }

        if (!kidRow) {
          throw new Error("Helper not found.");
        }

        const typedKid = kidRow as KidRow;

        const { data: assignmentRows, error: assignmentsError } =
          await supabase
            .from("chore_assignments")
            .select(
              `
                id,
                household_id,
                kid_id,
                chore_id,
                status,
                assigned_for_date,
                chores!chore_assignments_chore_id_fkey(
                  title,
                  recurrence_type,
                  star_value,
                  category
                )
              `
            )
            .eq("kid_id", kidId)
            .in("status", ["assigned", "approved"])
            .order("assigned_for_date", {
              ascending: true,
              nullsFirst: true,
            });

        if (cancelled) return;

        if (assignmentsError) {
          throw assignmentsError;
        }

        const { data: recurringRows, error: recurringError } = await supabase
          .from("chores")
          .select(
            "id, household_id, kid_id, title, recurrence_type, star_value, category, is_active"
          )
          .eq("kid_id", kidId)
          .eq("is_active", true)
          .in("recurrence_type", ["daily", "weekly", "biweekly"])
          .order("title", { ascending: true });

        if (cancelled) return;

        if (recurringError) {
          throw recurringError;
        }

        const normalizedAssignments = (
          (assignmentRows as AssignmentRow[]) || []
        ).map(normalizeAssignment);

        const todayIso = getTodayIso();

        const visibleAssignments = normalizedAssignments.filter((item) => {
          if (item.status === "assigned") {
            return true;
          }

          if (item.status === "completed") {
            if (item.recurrence_type === "one_off") {
              return true;
            }

            return item.assigned_for_date === todayIso;
          }

          return false;
        });

        const choresCompletedTodayIds = new Set(
          visibleAssignments
            .filter(
              (item) =>
                item.status === "completed" &&
                item.recurrence_type !== "one_off"
            )
            .map((item) => item.chore_id)
        );

        const normalizedRecurring = ((recurringRows as ChoreRow[]) || [])
          .filter((row) => !choresCompletedTodayIds.has(row.id))
          .map(normalizeRecurringChore);

        setKid(typedKid);
        setChoreItems([...visibleAssignments, ...normalizedRecurring]);
      } catch (err: unknown) {
        console.error("Unable to load helper chores:", err);

        if (!cancelled) {
          setPageError(
            typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
              ? String((err as { message: string }).message)
              : "Unable to load chores."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadKidChores();

    return () => {
      cancelled = true;
    };
  }, [kidId, supabase]);

  async function completeChore(item: KidChoreItem) {
    if (!kid || item.status === "completed" || updatingId !== null) {
      return;
    }

    setPageError("");
    setMessage("");

    setCompletionErrors((previous) => {
      const next = { ...previous };
      delete next[item.id];
      return next;
    });

    setUpdatingId(item.id);

    try {
      const assignmentId = item.source === "assignment" ? item.id : null;

      const { data, error } = await supabase
        .rpc("complete_kid_chore", {
          p_kid_id: kid.id,
          p_chore_id: item.chore_id,
          p_assignment_id: assignmentId,
        })
        .single();

      if (error) {
        throw error;
      }

      const result = data as CompleteKidChoreResult | null;

      if (!result) {
        throw new Error("No completion result was returned.");
      }

      setKid((current) =>
        current ? { ...current, stars: result.stars } : current
      );

      setChoreItems((previous) =>
        previous.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                id: result.assignment_id,
                source: "assignment",
                status: "completed",
                assigned_for_date: result.assigned_for_date,
              }
            : entry
        )
      );

      setMessage(
        `You earned ${result.stars_earned} ${
          result.stars_earned === 1 ? "star" : "stars"
        }!`
      );
    } catch (err: unknown) {
      console.error("complete_kid_chore failed", err);

      const detailedMessage =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Unable to complete this chore.";

      const finalMessage =
        detailedMessage || "Unable to complete this chore.";

      const alreadyCompleted =
        finalMessage.toLowerCase().includes("already been completed") ||
        finalMessage.toLowerCase().includes("already completed");

      if (alreadyCompleted) {
        setChoreItems((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  source: "assignment",
                  status: "completed",
                  assigned_for_date: getTodayIso(),
                }
              : entry
          )
        );

        setMessage("Already completed today!");
        return;
      }

      setCompletionErrors((previous) => ({
        ...previous,
        [item.id]: finalMessage,
      }));
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--muted)]">Loading chores…</p>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (pageError || !kid) {
    return (
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <section className="rounded-[2rem] border border-[var(--danger-border)] bg-white p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--danger-text)]">
                {pageError || "Helper not found."}
              </p>

              <Link
                href="/kids"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[var(--panel-soft)]"
              >
                Back to helpers
              </Link>
            </section>
          </div>
        </main>
      </>
    );
  }

  const heroStyle = getHeroStyle(kid);

  return (
    <>
      <AppNav />

      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section
            className={`relative overflow-hidden rounded-[2rem] p-6 shadow-[0_20px_60px_rgba(33,53,85,0.14)] sm:p-8 md:p-10 ${heroStyle.background} ${heroStyle.text}`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-7 select-none text-8xl opacity-25 sm:text-9xl"
            >
              ✨
            </span>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-20 top-10 select-none text-3xl opacity-45"
            >
              ★
            </span>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 right-8 select-none text-5xl opacity-30"
            >
              ✦
            </span>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-8 right-32 select-none text-3xl opacity-30"
            >
              ☁︎
            </span>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${heroStyle.softText}`}>
                  Today’s chores
                </p>

                <h1 className="mt-3 font-[family:var(--font-display)] text-5xl leading-none tracking-[-0.045em] sm:text-6xl">
                  {kid.name}
                </h1>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-lg font-bold shadow-sm ${heroStyle.chip}`}
              >
                <StarIcon className="h-5 w-5" />
                {kid.stars ?? 0}
              </div>
            </div>
          </section>

          {message && (
            <div
              className="mt-5 rounded-[1.5rem] border border-[var(--success-border)] bg-[var(--success-soft)] px-5 py-4 text-center text-base font-semibold text-[var(--success-text)] shadow-sm"
              role="status"
            >
              ✨ {message}
            </div>
          )}

          <section className="mt-8">
            {choreItems.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-white/75 p-10 text-center shadow-sm">
                <div className="text-5xl">🎉</div>

                <p className="mt-4 text-xl font-semibold text-[var(--foreground)]">
                  All done for now!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {choreItems.map((item) => {
                  const isCompleted = item.status === "completed";
                  const isUpdating = updatingId === item.id;
                  const inlineError = completionErrors[item.id];
                  const category = getChoreIcon(item.category);

                  return (
                    <article
                      key={item.id}
                      className={`rounded-[1.75rem] border p-4 shadow-sm transition-all duration-200 sm:p-5 ${
                        isCompleted
                          ? "border-[var(--border-soft)] bg-[#f1f3f5] opacity-75"
                          : "border-[var(--border-soft)] bg-white/88 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(33,53,85,0.10)]"
                      }`}
                    >
                      <div className="grid gap-4 sm:grid-cols-[76px_minmax(0,1fr)_minmax(180px,240px)] sm:items-center">
                        <div
                          className={`flex h-[76px] w-[76px] items-center justify-center rounded-[1.4rem] border ${
                            isCompleted
                              ? "border-[var(--border-soft)] bg-white/60 grayscale"
                              : "border-[var(--star-border)] bg-[var(--star-soft)]"
                          }`}
                        >
                          {category ? (
                            <Image
                              src={category.icon}
                              alt=""
                              width={52}
                              height={52}
                              className="h-12 w-12 object-contain"
                            />
                          ) : (
                            <span className="text-4xl" aria-hidden="true">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2
                            className={`text-2xl font-semibold tracking-tight sm:text-3xl ${
                              isCompleted
                                ? "text-[var(--muted)] line-through"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            {item.title}
                          </h2>

                          <div className="mt-3 flex flex-wrap items-center gap-1">
                            {Array.from({
                              length: Math.min(Math.max(item.star_value, 1), 8),
                            }).map((_, index) => (
                              <StarIcon
                                key={`${item.id}-star-${index}`}
                                className={`h-5 w-5 ${
                                  isCompleted
                                    ? "text-[var(--muted)]"
                                    : "text-[var(--star-text)]"
                                }`}
                              />
                            ))}

                            {item.star_value > 8 && (
                              <span
                                className={`ml-1 text-sm font-bold ${
                                  isCompleted
                                    ? "text-[var(--muted)]"
                                    : "text-[var(--star-text)]"
                                }`}
                              >
                                +{item.star_value - 8}
                              </span>
                            )}
                          </div>
                        </div>

                        {isCompleted ? (
                          <button
                            type="button"
                            disabled
                            className="inline-flex min-h-[76px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-[1.35rem] border border-[var(--border-soft)] bg-[var(--panel-soft)] px-5 py-4 text-lg font-bold text-[var(--muted)]"
                          >
                            <span className="text-3xl">✓</span>
                            Done!
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void completeChore(item)}
                            disabled={updatingId !== null}
                            className="inline-flex min-h-[76px] w-full items-center justify-center gap-3 rounded-[1.35rem] bg-[var(--accent)] px-5 py-4 text-lg font-bold text-white shadow-[0_12px_28px_rgba(15,118,110,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="text-3xl">✓</span>
                            {isUpdating ? "Saving…" : "I did it!"}
                          </button>
                        )}
                      </div>

                      {inlineError && (
                        <div
                          role="alert"
                          className="mt-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-center text-sm font-medium text-[var(--danger-text)]"
                        >
                          {inlineError}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="mt-8 text-center">
            <Link
              href="/kids"
              className="inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)]"
            >
              Choose a different helper
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}