"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type RecurrenceType = "one_off" | "daily" | "weekly" | "biweekly";

type KidRow = {
  id: string;
  name: string;
  household_id: string;
  stars: number | null;
  level: number | null;
};

type ChoreRelation =
  | {
      title?: string;
      recurrence_type?: RecurrenceType;
    }
  | {
      title?: string;
      recurrence_type?: RecurrenceType;
    }[]
  | null;

type AssignmentRow = {
  id: string;
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
  chores: ChoreRelation;
};

type ChoreRow = {
  id: string;
  household_id: string;
  kid_id: string | null;
  title: string;
  description: string | null;
  recurrence_type: RecurrenceType;
  is_active: boolean;
};

type KidChoreItem = {
  id: string;
  source: "assignment" | "recurring";
  chore_id: string;
  title: string;
  recurrence_type: RecurrenceType | null;
  status: "assigned" | "done" | "recurring";
  assigned_for_date: string | null;
  notes: string | null;
  description?: string | null;
};

function getChoreField(
  relation: ChoreRelation,
  field: "title" | "recurrence_type"
) {
  if (!relation) return "";
  if (Array.isArray(relation)) {
    const value = relation[0]?.[field];
    return typeof value === "string" ? value : "";
  }
  const value = relation[field];
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
    title: getChoreField(row.chores, "title"),
    recurrence_type: recurrenceType || null,
    status: row.status === "done" ? "done" : "assigned",
    assigned_for_date: row.assigned_for_date,
    notes: row.notes,
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
    notes: null,
    description: row.description,
  };
}

function getStatusStyles(status: KidChoreItem["status"]) {
  switch (status) {
    case "done":
      return "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-text)]";
    case "recurring":
      return "border-[var(--border-strong)] bg-white/80 text-[var(--foreground-soft)]";
    default:
      return "border-[var(--star-border)] bg-[var(--star-soft)] text-[var(--star-text)]";
  }
}

function getStatusLabel(status: KidChoreItem["status"]) {
  switch (status) {
    case "done":
      return "Waiting for approval";
    case "recurring":
      return "Available today";
    default:
      return "Assigned";
  }
}

function getRecurrenceLabel(recurrenceType: RecurrenceType | null) {
  switch (recurrenceType) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Every other week";
    case "one_off":
      return "One-off";
    default:
      return "Unknown";
  }
}

export default function KidChoresPage() {
  const supabase = createBrowserClient();
  const params = useParams();
  const kidId = typeof params.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");

  const [kid, setKid] = useState<KidRow | null>(null);
  const [choreItems, setChoreItems] = useState<KidChoreItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadKidChores() {
      setLoading(true);
      setPageError("");
      setMessage("");

      if (!kidId) {
        setPageError("No kid selected.");
        setLoading(false);
        return;
      }

      const { data: kidRow, error: kidError } = await supabase
        .from("kids")
        .select("id, name, household_id, stars, level")
        .eq("id", kidId)
        .maybeSingle();

      if (kidError) {
        setPageError(kidError.message);
        setLoading(false);
        return;
      }

      if (!kidRow) {
        setPageError("Kid not found.");
        setLoading(false);
        return;
      }

      const typedKid = kidRow as KidRow;

      const { data: assignmentRows, error: assignmentsError } = await supabase
        .from("chore_assignments")
        .select(`
          id,
          household_id,
          kid_id,
          chore_id,
          status,
          assigned_for_date,
          notes,
          chores!chore_assignments_chore_id_fkey(title, recurrence_type)
        `)
        .eq("kid_id", kidId)
        .in("status", ["assigned", "done"])
        .order("assigned_for_date", { ascending: true, nullsFirst: true });

      if (assignmentsError) {
        setPageError(assignmentsError.message);
        setLoading(false);
        return;
      }

      const { data: recurringRows, error: recurringError } = await supabase
        .from("chores")
        .select("id, household_id, kid_id, title, description, recurrence_type, is_active")
        .eq("kid_id", kidId)
        .eq("is_active", true)
        .in("recurrence_type", ["daily", "weekly", "biweekly"])
        .order("title", { ascending: true });

      if (recurringError) {
        setPageError(recurringError.message);
        setLoading(false);
        return;
      }

      const normalizedAssignments =
        ((assignmentRows as AssignmentRow[]) || []).map(normalizeAssignment);

      const assignedRecurringChoreIds = new Set(
        normalizedAssignments
          .filter((item) => item.recurrence_type && item.recurrence_type !== "one_off")
          .map((item) => item.chore_id)
      );

      const normalizedRecurring = ((recurringRows as ChoreRow[]) || [])
        .filter((row) => !assignedRecurringChoreIds.has(row.id))
        .map(normalizeRecurringChore);

      setKid(typedKid);
      setChoreItems([...normalizedAssignments, ...normalizedRecurring]);
      setLoading(false);
    }

    loadKidChores();
  }, [kidId, supabase]);

  async function markAsDone(item: KidChoreItem) {
    setPageError("");
    setMessage("");
    setUpdatingId(item.id);

    try {
      let updatedAssignment: AssignmentRow | null = null;

      if (item.source === "assignment") {
        const { data, error } = await supabase
          .from("chore_assignments")
          .update({ status: "done" } as never)
          .eq("id", item.id)
          .select(`
            id,
            household_id,
            kid_id,
            chore_id,
            status,
            assigned_for_date,
            notes,
            chores!chore_assignments_chore_id_fkey(title, recurrence_type)
          `)
          .single();

        if (error) {
          throw error;
        }

        updatedAssignment = data as AssignmentRow;
      } else {
        if (!kid) {
          throw new Error("Kid not loaded.");
        }

        const { data: existingAssignmentRaw, error: existingError } = await supabase
          .from("chore_assignments")
          .select(`
            id,
            household_id,
            kid_id,
            chore_id,
            status,
            assigned_for_date,
            notes,
            chores!chore_assignments_chore_id_fkey(title, recurrence_type)
          `)
          .eq("kid_id", kid.id)
          .eq("chore_id", item.chore_id)
          .order("assigned_for_date", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();

        const existingAssignment = existingAssignmentRaw as AssignmentRow | null;

        if (existingError) {
          throw existingError;
        }

        if (existingAssignment) {
          const { data, error } = await supabase
            .from("chore_assignments")
            .update({ status: "done" } as never)
            .eq("id", existingAssignment.id)
            .select(`
              id,
              household_id,
              kid_id,
              chore_id,
              status,
              assigned_for_date,
              notes,
              chores!chore_assignments_chore_id_fkey(title, recurrence_type)
            `)
            .single();

          if (error) {
            throw error;
          }

          updatedAssignment = data as AssignmentRow;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from("chore_assignments")
            .insert({
              household_id: kid.household_id,
              kid_id: kid.id,
              chore_id: item.chore_id,
              status: "done",
              assigned_for_date: null,
              notes: null,
            } as never)
            .select(`
              id,
              household_id,
              kid_id,
              chore_id,
              status,
              assigned_for_date,
              notes,
              chores!chore_assignments_chore_id_fkey(title, recurrence_type)
            `)
            .single();

          if (insertError) {
            throw insertError;
          }

          updatedAssignment = inserted as AssignmentRow;
        }
      }

      if (!updatedAssignment) {
        throw new Error("No updated assignment returned.");
      }

      const normalized = normalizeAssignment(updatedAssignment);

      setChoreItems((prev) => {
        const replaced = prev.map((entry) =>
          entry.source === "assignment" && entry.id === normalized.id
            ? normalized
            : entry
        );

        const withoutRecurringDuplicate = replaced.filter(
          (entry) =>
            !(
              entry.source === "recurring" &&
              entry.chore_id === normalized.chore_id
            )
        );

        const alreadyPresent = withoutRecurringDuplicate.some(
          (entry) => entry.source === "assignment" && entry.id === normalized.id
        );

        return alreadyPresent
          ? withoutRecurringDuplicate
          : [...withoutRecurringDuplicate, normalized];
      });

      setMessage("Nice job! This chore is now waiting for parent approval.");
    } catch (err: any) {
      setPageError(err?.message || "Unable to mark chore as done.");
    } finally {
      setUpdatingId(null);
    }
  }

  const assignedItems = useMemo(
    () => choreItems.filter((item) => item.status === "assigned"),
    [choreItems]
  );

  const waitingItems = useMemo(
    () => choreItems.filter((item) => item.status === "done"),
    [choreItems]
  );

  const recurringItems = useMemo(
    () => choreItems.filter((item) => item.status === "recurring"),
    [choreItems]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">Loading chores...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.55)_35%,_transparent_72%)]" />
          <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                  Today’s chores
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  {kid?.name}&rsquo;s chores
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">
                  Finish chores here, then wait for an adult to approve them and award your stars.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/kids/${kidId}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    Back to profile
                  </Link>

                  <Link
                    href="/kids"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    Back to kids
                  </Link>
                </div>
              </div>

              <div className="min-w-[230px] rounded-[1.75rem] border border-[var(--star-border)] bg-[linear-gradient(135deg,_#fff7d6_0%,_#ffe7b8_100%)] p-5 shadow-[0_14px_30px_rgba(138,90,0,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--star-text)]">
                  Progress
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                    {kid?.stars ?? 0}
                  </span>
                  <span className="pb-1 text-sm font-medium text-[var(--star-text)]">stars</span>
                </div>
                <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                  Level {kid?.level ?? 1} helper
                </p>
              </div>
            </div>

            {(message || pageError) && (
              <div className="mt-6 space-y-3">
                {message && (
                  <div className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-text)]">
                    {message}
                  </div>
                )}

                {pageError && (
                  <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
                    {pageError}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
              Assigned now
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {assignedItems.length}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Chores ready to complete.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
              Waiting
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {waitingItems.length}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Finished chores waiting for approval.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
              Recurring
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {recurringItems.length}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Active chores that come back on a schedule.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Current chores
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Do the chore, tap the button, and your grown-up can approve it later.
            </p>
          </div>

          {choreItems.length === 0 ? (
            <div className="mt-4 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-soft)] p-8">
              <p className="text-sm text-[var(--muted)]">No chores assigned right now.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {choreItems.map((item) => {
                const isAssigned = item.status === "assigned";
                const isDone = item.status === "done";
                const isRecurringOnly = item.source === "recurring";
                const isUpdating = updatingId === item.id;
                const isDaily = item.recurrence_type === "daily";

                return (
                  <article
                    key={item.id}
                    className={`rounded-[1.75rem] border p-5 shadow-sm transition-transform duration-200 ${
                      isDone
                        ? "border-[var(--success-border)] bg-[var(--success-soft)]"
                        : isRecurringOnly
                        ? "border-[var(--border-soft)] bg-white/78"
                        : "border-[var(--star-border)] bg-[linear-gradient(180deg,_#fffdfa_0%,_#fff7ea_100%)]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">
                            {item.title}
                          </h3>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>

                          <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--foreground-soft)]">
                            {getRecurrenceLabel(item.recurrence_type)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-[var(--muted)]">
                          {item.assigned_for_date
                            ? `Assigned for ${item.assigned_for_date}`
                            : isRecurringOnly
                            ? "Available as an active recurring chore."
                            : "No date assigned."}
                        </p>

                        {item.notes && (
                          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                            {item.notes}
                          </p>
                        )}

                        {item.description && (
                          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                            {item.description}
                          </p>
                        )}

                        {isDaily && (
                          <p className="mt-3 text-xs font-medium text-[var(--muted-strong)]">
                            Daily chores can be assigned again after approval.
                          </p>
                        )}
                      </div>

                      <div className="md:min-w-[210px]">
                        {isAssigned || isRecurringOnly ? (
                          <button
                            type="button"
                            onClick={() => markAsDone(item)}
                            disabled={isUpdating}
                            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdating ? "Saving..." : "I did it!"}
                          </button>
                        ) : isDone ? (
                          <div className="rounded-2xl border border-[var(--success-border)] bg-white/70 px-4 py-3 text-sm font-medium text-[var(--success-text)]">
                            Waiting for parent approval
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}