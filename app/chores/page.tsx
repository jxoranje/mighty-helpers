"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { ChoreCategoryBadge, ChoreCategoryPicker } from "@/app/components/chore-category-picker";
import type { ChoreCategoryKey } from "@/lib/chore-categories";

type HouseholdMemberLookup = {
  household_id: string;
};

type RecurrenceType = "one_off" | "daily" | "weekly" | "biweekly";

type Kid = {
  id: string;
  name: string;
};

type ChoreRow = {
  id: string;
  household_id: string;
  kid_id: string | null;
  title: string;
  description: string | null;
  star_value: number;
  category: string | null;
  recurrence_type: RecurrenceType;
  is_active: boolean;
  kids: { name: string } | { name: string }[] | null;
};

type Chore = {
  id: string;
  household_id: string;
  kid_id: string | null;
  kid_name: string;
  title: string;
  description: string | null;
  star_value: number;
  category: string | null;
  recurrence_type: RecurrenceType;
  is_active: boolean;
};

type ChoreInsert = {
  household_id: string;
  kid_id: string;
  title: string;
  description: string | null;
  star_value: number;
  category: string | null;
  recurrence_type: RecurrenceType;
  is_active: boolean;
};

type ChoreUpdate = {
  kid_id: string;
  title: string;
  description: string | null;
  star_value: number;
  category: string | null;
  recurrence_type: RecurrenceType;
  is_active: boolean;
};

function formatRecurrenceLabel(recurrenceType: RecurrenceType) {
  switch (recurrenceType) {
    case "one_off":
      return "One-off";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Every other week";
  }
}

function getKidName(relation: { name: string } | { name: string }[] | null) {
  if (!relation) return "";
  if (Array.isArray(relation)) return relation[0]?.name ?? "";
  return relation.name ?? "";
}

function normalizeChore(row: ChoreRow): Chore {
  return {
    id: row.id,
    household_id: row.household_id,
    kid_id: row.kid_id,
    kid_name: getKidName(row.kids),
    title: row.title,
    description: row.description,
    star_value: row.star_value,
    category: row.category,
    recurrence_type: row.recurrence_type,
    is_active: row.is_active,
  };
}

function sortChores(list: Chore[]) {
  return [...list].sort((a, b) => {
    const kidCompare = (a.kid_name || "").localeCompare(b.kid_name || "");
    if (kidCompare !== 0) return kidCompare;
    return a.title.localeCompare(b.title);
  });
}

function getTone(index: number) {
  const tones = [
    {
      card: "bg-[linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(255,248,238,0.96))] border-[rgba(196,168,129,0.22)]",
      badge: "bg-[rgba(255,255,255,0.78)] text-[var(--foreground)] border-[rgba(196,168,129,0.18)]",
      accent: "text-[var(--accent-strong)]",
    },
    {
      card: "bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(244,250,255,0.96))] border-[rgba(119,154,196,0.20)]",
      badge: "bg-[rgba(255,255,255,0.78)] text-[var(--foreground)] border-[rgba(119,154,196,0.18)]",
      accent: "text-[var(--accent)]",
    },
    {
      card: "bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(245,252,246,0.96))] border-[rgba(126,171,139,0.20)]",
      badge: "bg-[rgba(255,255,255,0.78)] text-[var(--foreground)] border-[rgba(126,171,139,0.18)]",
      accent: "text-[var(--success-strong)]",
    },
  ];

  return tones[index % tones.length];
}

function SectionMessage({
  type,
  children,
}: {
  type: "success" | "error";
  children: React.ReactNode;
}) {
  const styles =
    type === "success"
      ? "border-[rgba(96,145,107,0.20)] bg-[rgba(242,251,244,0.95)] text-[rgb(54,98,63)]"
      : "border-[rgba(190,84,84,0.18)] bg-[rgba(255,240,240,0.95)] text-[rgb(140,62,62)]";

  return (
    <div className={`rounded-[1.35rem] border px-4 py-3 text-sm shadow-sm ${styles}`}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
      {children}
    </label>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[1.1rem] border border-[var(--border-soft)] bg-white/88 px-4 py-3 text-[var(--foreground)] outline-none transition-all duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(127,168,212,0.14)]"
    />
  );
}

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-[1.1rem] border border-[var(--border-soft)] bg-white/88 px-4 py-3 text-[var(--foreground)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(127,168,212,0.14)]"
    />
  );
}

function FieldCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[var(--border-strong)]"
      />
      {label}
    </label>
  );
}

export default function ChoresPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [chores, setChores] = useState<Chore[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const [newKidId, setNewKidId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStarValue, setNewStarValue] = useState("1");
  const [newCategory, setNewCategory] = useState<ChoreCategoryKey | "">("");
  const [newRecurrenceType, setNewRecurrenceType] =
    useState<RecurrenceType>("daily");
  const [newIsActive, setNewIsActive] = useState(true);

  const [editingChoreId, setEditingChoreId] = useState<string | null>(null);
  const [editingKidId, setEditingKidId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStarValue, setEditingStarValue] = useState("1");
  const [editingCategory, setEditingCategory] = useState<ChoreCategoryKey | "">("");
  const [editingRecurrenceType, setEditingRecurrenceType] =
    useState<RecurrenceType>("daily");
  const [editingIsActive, setEditingIsActive] = useState(true);

  const [chorePendingDeleteId, setChorePendingDeleteId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadChores() {
      setLoading(true);
      setError("");
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const { data: memberRow, error: memberError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const typedMemberRow = memberRow as HouseholdMemberLookup | null;

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      if (!typedMemberRow?.household_id) {
        setError("No household found for this user.");
        setLoading(false);
        return;
      }

      const hid = typedMemberRow.household_id;
      setHouseholdId(hid);

      const [
        { data: kidRows, error: kidsError },
        { data: choreRows, error: choresError },
      ] = await Promise.all([
        supabase
          .from("kids")
          .select("id, name")
          .eq("household_id", hid)
          .is("archived_at", null)
          .order("name", { ascending: true }),
        supabase
          .from("chores")
          .select(
            `
              id,
              household_id,
              kid_id,
              title,
              description,
              star_value,
              category,
              recurrence_type,
              is_active,
              kids(name)
            `
          )
          .eq("household_id", hid)
          .order("created_at", { ascending: true }),
      ]);

      if (kidsError) {
        setError(kidsError.message);
        setLoading(false);
        return;
      }

      if (choresError) {
        setError(choresError.message);
        setLoading(false);
        return;
      }

      setKids((kidRows as Kid[]) || []);
      setChores(sortChores(((choreRows as ChoreRow[]) || []).map(normalizeChore)));
      setLoading(false);
    }

    loadChores();
  }, [supabase]);

  async function handleCreateChore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Household not loaded yet.");
      return;
    }

    if (!newKidId) {
      setError("Please choose a kid for this chore.");
      return;
    }

    const title = newTitle.trim();
    const starValue = parseInt(newStarValue, 10);

    if (!title) {
      setError("Please enter a chore title.");
      return;
    }

    if (Number.isNaN(starValue) || starValue < 0) {
      setError("Please enter a valid star value.");
      return;
    }

    const chorePayload: ChoreInsert = {
      household_id: householdId,
      kid_id: newKidId,
      title,
      description: newDescription.trim() || null,
      star_value: starValue,
      category: newCategory || null,
      recurrence_type: newRecurrenceType,
      is_active: newIsActive,
    };

    const { data, error: insertError } = await supabase
      .from("chores")
      .insert(chorePayload as never)
      .select(
        `
          id,
          household_id,
          kid_id,
          title,
          description,
          star_value,
          category,
          recurrence_type,
          is_active,
          kids(name)
        `
      )
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setChores((prev) => sortChores([...prev, normalizeChore(data as ChoreRow)]));
    setNewKidId("");
    setNewTitle("");
    setNewDescription("");
    setNewStarValue("1");
    setNewCategory("");
    setNewRecurrenceType("daily");
    setNewIsActive(true);
    setMessage("Chore added.");
  }

  function startEditingChore(chore: Chore) {
    setChorePendingDeleteId(null);
    setEditingChoreId(chore.id);
    setEditingKidId(chore.kid_id ?? "");
    setEditingTitle(chore.title);
    setEditingDescription(chore.description ?? "");
    setEditingStarValue(String(chore.star_value));
    setEditingCategory((chore.category as ChoreCategoryKey) ?? "");
    setEditingRecurrenceType(chore.recurrence_type);
    setEditingIsActive(chore.is_active);
    setError("");
    setMessage("");
  }

  function cancelEditingChore() {
    setEditingChoreId(null);
    setEditingKidId("");
    setEditingTitle("");
    setEditingDescription("");
    setEditingStarValue("1");
    setEditingCategory("");
    setEditingRecurrenceType("daily");
    setEditingIsActive(true);
  }

  async function handleUpdateChore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!editingChoreId || !householdId) {
      setError("No chore selected for editing.");
      return;
    }

    if (!editingKidId) {
      setError("Please choose a kid for this chore.");
      return;
    }

    const title = editingTitle.trim();
    const starValue = parseInt(editingStarValue, 10);

    if (!title) {
      setError("Please enter a chore title.");
      return;
    }

    if (Number.isNaN(starValue) || starValue < 0) {
      setError("Please enter a valid star value.");
      return;
    }

    const choreUpdatePayload: ChoreUpdate = {
      kid_id: editingKidId,
      title,
      description: editingDescription.trim() || null,
      star_value: starValue,
      category: editingCategory || null,
      recurrence_type: editingRecurrenceType,
      is_active: editingIsActive,
    };

    const { data, error: updateError } = await supabase
      .from("chores")
      .update(choreUpdatePayload as never)
      .eq("id", editingChoreId)
      .eq("household_id", householdId)
      .select(
        `
          id,
          household_id,
          kid_id,
          title,
          description,
          star_value,
          category,
          recurrence_type,
          is_active,
          kids(name)
        `
      )
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setChores((prev) =>
      sortChores(
        prev.map((chore) =>
          chore.id === editingChoreId ? normalizeChore(data as ChoreRow) : chore
        )
      )
    );
    setMessage("Chore updated.");
    cancelEditingChore();
  }

  async function handleDeleteChore(id: string) {
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Household not loaded yet.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("chores")
      .delete()
      .eq("id", id)
      .eq("household_id", householdId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setChores((prev) => prev.filter((chore) => chore.id !== id));
    setChorePendingDeleteId(null);
    setMessage("Chore deleted.");
  }

  const activeCount = useMemo(
    () => chores.filter((chore) => chore.is_active).length,
    [chores]
  );

  const totalStars = useMemo(
    () => chores.reduce((sum, chore) => sum + (chore.star_value || 0), 0),
    [chores]
  );

  const editingMode = Boolean(editingChoreId);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <p className="text-sm text-[var(--muted)]">Loading chores...</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.55)_34%,_transparent_72%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-60" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-50" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                ← Back to home
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Manage your household
              </button>
            </div>

            {error === "You are not logged in." && (
              <div className="mt-5">
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                >
                  Log in to your household
                </Link>
              </div>
            )}

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] shadow-sm">
                  Household chores
                </div>

                <h1 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-6xl">
                  Build routines that feel clear and motivating
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                  Add chores, assign them to each child, and keep the reward loop easy to manage.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/72 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                    Total chores
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {chores.length}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/72 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                    Active chores
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {activeCount}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--star-border)] bg-[linear-gradient(180deg,_#fffaf0_0%,_#fff2d6_100%)] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--star-text)]">
                    Total stars
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {totalStars}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {message && <SectionMessage type="success">{message}</SectionMessage>}
              {error && <SectionMessage type="error">{error}</SectionMessage>}
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-[1.85rem] border border-[var(--border-soft)] bg-white/74 p-5 shadow-sm backdrop-blur sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                      Current chores
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      Household list
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--muted)]">Sorted by child, then title.</p>
                </div>

                {chores.length === 0 ? (
                  <div className="mt-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--panel-soft)] px-5 py-6 text-sm text-[var(--muted)]">
                    No chores yet. Add your first one on this page.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {chores.map((chore, index) => {
                      const tone = getTone(index);

                      return (
                        <article
                          key={chore.id}
                          className={`rounded-[1.6rem] border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${tone.card}`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-2">
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                                  {chore.kid_name || "Unknown"}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                                  {formatRecurrenceLabel(chore.recurrence_type)}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                                  {chore.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>

                              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                                {chore.title}
                              </h3>

                              {chore.description && (
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--foreground-soft)] sm:text-base">
                                  {chore.description}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-semibold text-[var(--foreground)]">
                                  {chore.star_value} stars
                                </span>
                                {chore.category && (
                                  <ChoreCategoryBadge categoryKey={chore.category} />
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                              {chorePendingDeleteId === chore.id ? (
                                <div className="flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-[rgba(190,84,84,0.18)] bg-[rgba(255,240,240,0.96)] px-3 py-3">
                                  <span className="text-xs font-medium text-[rgb(140,62,62)]">
                                    Delete this chore?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChore(chore.id)}
                                    className="rounded-full bg-[rgb(173,67,67)] px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[rgb(153,57,57)]"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChorePendingDeleteId(null)}
                                    className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--panel-soft)]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditingChore(chore)}
                                    className={`rounded-full border bg-white/78 px-4 py-2 text-sm font-semibold shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${tone.accent}`}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      cancelEditingChore();
                                      setChorePendingDeleteId(chore.id);
                                    }}
                                    className="rounded-full border border-[rgba(190,84,84,0.20)] bg-white/85 px-4 py-2 text-sm font-semibold text-[rgb(140,62,62)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-[1.85rem] border border-[var(--border-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(255,250,244,0.95))] p-5 shadow-sm sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-strong)]">
                    {editingMode ? "Edit mode" : "Create mode"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {editingMode ? "Update chore" : "Add a new chore"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {editingMode
                      ? "Update the details below, then save your changes."
                      : "Create chores that are simple to understand and easy for kids to complete."}
                  </p>
                </div>

                {kids.length === 0 ? (
                  <div className="mt-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/80 px-5 py-6 text-sm text-[var(--muted)]">
                    Add at least one active kid before managing chores.
                  </div>
                ) : !editingMode ? (
                  <form onSubmit={handleCreateChore} className="mt-6 space-y-5">
                    <div>
                      <FieldLabel>Kid</FieldLabel>
                      <FieldSelect value={newKidId} onChange={(e) => setNewKidId(e.target.value)}>
                        <option value="">Select a kid</option>
                        {kids.map((kid) => (
                          <option key={kid.id} value={kid.id}>
                            {kid.name}
                          </option>
                        ))}
                      </FieldSelect>
                    </div>

                    <div>
                      <FieldLabel>Title</FieldLabel>
                      <FieldInput
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Brush teeth"
                      />
                    </div>

                    <div>
                      <FieldLabel>Description (optional)</FieldLabel>
                      <FieldInput
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Brush for two minutes before bed"
                      />
                    </div>

                    <div>
                      <FieldLabel>Star value</FieldLabel>
                      <FieldInput
                        type="number"
                        min="0"
                        value={newStarValue}
                        onChange={(e) => setNewStarValue(e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Category icon (optional)</FieldLabel>
                      <ChoreCategoryPicker value={newCategory} onChange={setNewCategory} />
                    </div>

                    <div>
                      <FieldLabel>Recurrence</FieldLabel>
                      <FieldSelect
                        value={newRecurrenceType}
                        onChange={(e) => setNewRecurrenceType(e.target.value as RecurrenceType)}
                      >
                        <option value="one_off">One-off</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every other week</option>
                      </FieldSelect>
                    </div>

                    <div>
                      <FieldCheckbox checked={newIsActive} onChange={setNewIsActive} label="Active chore" />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_35px_rgba(66,109,163,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] active:translate-y-0"
                    >
                      Add chore
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleUpdateChore} className="mt-6 space-y-5">
                    <div>
                      <FieldLabel>Kid</FieldLabel>
                      <FieldSelect
                        value={editingKidId}
                        onChange={(e) => setEditingKidId(e.target.value)}
                      >
                        <option value="">Select a kid</option>
                        {kids.map((kid) => (
                          <option key={kid.id} value={kid.id}>
                            {kid.name}
                          </option>
                        ))}
                      </FieldSelect>
                    </div>

                    <div>
                      <FieldLabel>Title</FieldLabel>
                      <FieldInput
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Description (optional)</FieldLabel>
                      <FieldInput
                        type="text"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Star value</FieldLabel>
                      <FieldInput
                        type="number"
                        min="0"
                        value={editingStarValue}
                        onChange={(e) => setEditingStarValue(e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Category icon (optional)</FieldLabel>
                      <ChoreCategoryPicker value={editingCategory} onChange={setEditingCategory} />
                    </div>

                    <div>
                      <FieldLabel>Recurrence</FieldLabel>
                      <FieldSelect
                        value={editingRecurrenceType}
                        onChange={(e) =>
                          setEditingRecurrenceType(e.target.value as RecurrenceType)
                        }
                      >
                        <option value="one_off">One-off</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every other week</option>
                      </FieldSelect>
                    </div>

                    <div>
                      <FieldCheckbox
                        checked={editingIsActive}
                        onChange={setEditingIsActive}
                        label="Active chore"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="submit"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_35px_rgba(66,109,163,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] active:translate-y-0"
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingChore}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}