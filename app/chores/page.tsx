"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  ChoreCategoryBadge,
  ChoreCategoryPicker,
} from "@/app/components/chore-category-picker";
import type { ChoreCategoryKey } from "@/lib/chore-categories";
import AppNav from "@/app/components/AppNav";

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

type NoticeType = "success" | "error";

const CHORE_SELECT = `
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
`;

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

    if (kidCompare !== 0) {
      return kidCompare;
    }

    return a.title.localeCompare(b.title);
  });
}

function Notice({
  type,
  children,
}: {
  type: NoticeType;
  children: React.ReactNode;
}) {
  const classes =
    type === "success"
      ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-text)]"
      : "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-text)]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${classes}`}>
      {children}
    </div>
  );
}

function StatCard({
  label,
  number,
  tone,
}: {
  label: string;
  number: number;
  tone: "accent" | "success" | "star";
}) {
  const tones = {
    accent:
      "border-[var(--border-soft)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    success:
      "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-text)]",
    star: "border-[var(--star-border)] bg-[var(--star-soft)] text-[var(--star-text)]",
  };

  return (
    <article className={`rounded-[1.5rem] border p-4 ${tones[tone]}`}>
      <p className="text-2xl font-semibold">{number}</p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
        {label}
      </p>
    </article>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-[var(--foreground)]"
    >
      {children}
    </label>
  );
}

function FieldInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    inputRef?: React.RefObject<HTMLInputElement | null>;
  }
) {
  const { inputRef, ...inputProps } = props;

  return (
    <input
      ref={inputRef}
      {...inputProps}
      className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
    />
  );
}

function FieldSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
    />
  );
}

function FieldCheckbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-white/80 p-4 transition-colors hover:bg-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--accent)]"
      />

      <span>
        <span className="block text-sm font-semibold text-[var(--foreground)]">
          {label}
        </span>

        <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}

type ChoreFormProps = {
  mode: "create" | "edit";
  kids: Kid[];
  kidId: string;
  title: string;
  description: string;
  starValue: string;
  category: ChoreCategoryKey | "";
  recurrenceType: RecurrenceType;
  isActive: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onKidChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStarValueChange: (value: string) => void;
  onCategoryChange: (value: ChoreCategoryKey | "") => void;
  onRecurrenceTypeChange: (value: RecurrenceType) => void;
  onActiveChange: (value: boolean) => void;
  onCancel?: () => void;
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
};

function ChoreForm({
  mode,
  kids,
  kidId,
  title,
  description,
  starValue,
  category,
  recurrenceType,
  isActive,
  submitLabel,
  onSubmit,
  onKidChange,
  onTitleChange,
  onDescriptionChange,
  onStarValueChange,
  onCategoryChange,
  onRecurrenceTypeChange,
  onActiveChange,
  onCancel,
  titleInputRef,
}: ChoreFormProps) {
  const isEditing = mode === "edit";

  if (kids.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-5 text-sm leading-6 text-[var(--muted)]">
        Add at least one active helper in the Parent Dashboard before creating
        chores.
        <Link
          href="/dashboard"
          className="mt-3 inline-flex font-semibold text-[var(--accent)] underline underline-offset-4"
        >
          Go to Parent Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <FieldLabel htmlFor="chore-helper">Helper</FieldLabel>

        <FieldSelect
          id="chore-helper"
          value={kidId}
          onChange={(event) => onKidChange(event.target.value)}
        >
          <option value="">Select a helper</option>

          {kids.map((kid) => (
            <option key={kid.id} value={kid.id}>
              {kid.name}
            </option>
          ))}
        </FieldSelect>
      </div>

      <div>
        <FieldLabel htmlFor="chore-title">Chore name</FieldLabel>

        <FieldInput
          inputRef={titleInputRef}
          id="chore-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Brush teeth"
        />
      </div>

      <div>
        <FieldLabel htmlFor="chore-description">
          Description <span className="font-normal text-[var(--muted)]">(optional)</span>
        </FieldLabel>

        <textarea
          id="chore-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Brush for two minutes before bed."
          rows={3}
          className="w-full resize-none rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="chore-stars">Star value</FieldLabel>

          <div className="relative">
            <FieldInput
              id="chore-stars"
              type="number"
              min="0"
              value={starValue}
              onChange={(event) => onStarValueChange(event.target.value)}
              className="pr-16"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--star-text)]">
              stars
            </span>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="chore-recurrence">Recurrence</FieldLabel>

          <FieldSelect
            id="chore-recurrence"
            value={recurrenceType}
            onChange={(event) =>
              onRecurrenceTypeChange(event.target.value as RecurrenceType)
            }
          >
            <option value="one_off">One-off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every other week</option>
          </FieldSelect>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="chore-category">
          Category icon <span className="font-normal text-[var(--muted)]">(optional)</span>
        </FieldLabel>

        <div id="chore-category">
          <ChoreCategoryPicker
            value={category}
            onChange={onCategoryChange}
          />
        </div>
      </div>

      <FieldCheckbox
        checked={isActive}
        onChange={onActiveChange}
        label="Active chore"
        description="Active chores appear in the helper’s everyday chore list."
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.24)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          {submitLabel}
        </button>

        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function ChoresPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const choreFormRef = useRef<HTMLElement | null>(null);
  const choreTitleInputRef = useRef<HTMLInputElement | null>(null);

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
  const [editingCategory, setEditingCategory] = useState<
    ChoreCategoryKey | ""
  >("");
  const [editingRecurrenceType, setEditingRecurrenceType] =
    useState<RecurrenceType>("daily");
  const [editingIsActive, setEditingIsActive] = useState(true);

  const [chorePendingDeleteId, setChorePendingDeleteId] = useState<
    string | null
  >(null);

  const [savingChore, setSavingChore] = useState(false);
  const [deletingChoreId, setDeletingChoreId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChores() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !user) {
          throw new Error("You are not logged in.");
        }

        const { data: memberRow, error: memberError } = await supabase
          .from("household_members")
          .select("household_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (memberError) {
          throw memberError;
        }

        const typedMemberRow = memberRow as HouseholdMemberLookup | null;

        if (!typedMemberRow?.household_id) {
          throw new Error("No household found for this user.");
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
            .select(CHORE_SELECT)
            .eq("household_id", hid)
            .order("created_at", { ascending: true }),
        ]);

        if (cancelled) return;

        if (kidsError) {
          throw kidsError;
        }

        if (choresError) {
          throw choresError;
        }

        setKids((kidRows as Kid[]) || []);
        setChores(
          sortChores(((choreRows as ChoreRow[]) || []).map(normalizeChore))
        );
      } catch (err: unknown) {
        console.error("Unable to load chores:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your household chores."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadChores();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function resetNewChoreForm() {
    setNewKidId("");
    setNewTitle("");
    setNewDescription("");
    setNewStarValue("1");
    setNewCategory("");
    setNewRecurrenceType("daily");
    setNewIsActive(true);
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
    setChorePendingDeleteId(null);
  }

  function focusChoreForm() {
    setError("");
    setMessage("");
    cancelEditingChore();

    window.setTimeout(() => {
      choreFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      choreTitleInputRef.current?.focus();
    }, 0);
  }

  async function handleCreateChore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    if (!newKidId) {
      setError("Please choose a helper for this chore.");
      return;
    }

    const title = newTitle.trim();
    const starValue = Number.parseInt(newStarValue, 10);

    if (!title) {
      setError("Please enter a chore name.");
      return;
    }

    if (Number.isNaN(starValue) || starValue < 0) {
      setError("Please enter a valid star value.");
      return;
    }

    setSavingChore(true);

    try {
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
        .select(CHORE_SELECT)
        .single();

      if (insertError) {
        throw insertError;
      }

      const newChore = normalizeChore(data as ChoreRow);

      setChores((previous) => sortChores([...previous, newChore]));
      resetNewChoreForm();
      setMessage(`${newChore.title} was added.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to add this chore."
      );
    } finally {
      setSavingChore(false);
    }
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

    window.setTimeout(() => {
      choreFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      choreTitleInputRef.current?.focus();
    }, 0);
  }

  async function handleUpdateChore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!editingChoreId || !householdId) {
      setError("No chore selected for editing.");
      return;
    }

    if (!editingKidId) {
      setError("Please choose a helper for this chore.");
      return;
    }

    const title = editingTitle.trim();
    const starValue = Number.parseInt(editingStarValue, 10);

    if (!title) {
      setError("Please enter a chore name.");
      return;
    }

    if (Number.isNaN(starValue) || starValue < 0) {
      setError("Please enter a valid star value.");
      return;
    }

    setSavingChore(true);

    try {
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
        .select(CHORE_SELECT)
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedChore = normalizeChore(data as ChoreRow);

      setChores((previous) =>
        sortChores(
          previous.map((chore) =>
            chore.id === editingChoreId ? updatedChore : chore
          )
        )
      );

      cancelEditingChore();
      setMessage(`${updatedChore.title} was updated.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update this chore."
      );
    } finally {
      setSavingChore(false);
    }
  }

  async function handleDeleteChore(id: string) {
    setError("");
    setMessage("");

    if (!householdId) {
      setError("Your household has not loaded yet. Please refresh and try again.");
      return;
    }

    setDeletingChoreId(id);

    try {
      const { error: deleteError } = await supabase
        .from("chores")
        .delete()
        .eq("id", id)
        .eq("household_id", householdId);

      if (deleteError) {
        throw deleteError;
      }

      setChores((previous) => previous.filter((chore) => chore.id !== id));
      setChorePendingDeleteId(null);

      if (editingChoreId === id) {
        cancelEditingChore();
      }

      setMessage("Chore deleted.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this chore."
      );
    } finally {
      setDeletingChoreId(null);
    }
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
      <>
        <AppNav />

        <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <section className="rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
              <p className="text-sm text-[var(--muted)]">
                Loading household chores…
              </p>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppNav />

      <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />
            <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-55" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
            <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-45" />

            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
                    Parent tools
                  </p>

                  <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                    Chores
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                    Create clear tasks, assign them to helpers, and set the
                    stars each chore earns.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={focusChoreForm}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
                >
                  + Add chore
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Total chores"
                  number={chores.length}
                  tone="accent"
                />
                <StatCard
                  label="Active chores"
                  number={activeCount}
                  tone="success"
                />
                <StatCard
                  label="Stars available"
                  number={totalStars}
                  tone="star"
                />
              </div>

              {(message || error) && (
                <div className="mt-6 space-y-3">
                  {message && <Notice type="success">{message}</Notice>}
                  {error && <Notice type="error">{error}</Notice>}
                </div>
              )}

              <div className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <section>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                        Chore library
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        Current chores
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Create, edit, assign, and organize the tasks your
                        household uses.
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--muted-strong)]">
                      {chores.length}{" "}
                      {chores.length === 1 ? "chore" : "chores"}
                    </span>
                  </div>

                  {chores.length === 0 ? (
                    <div className="mt-5 rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)] p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-3xl">
                        ✓
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                        Create your first chore
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                        Begin with a small, clear task your helper can complete
                        today.
                      </p>

                      <button
                        type="button"
                        onClick={focusChoreForm}
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                      >
                        Add a chore
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {chores.map((chore, index) => {
                        const isPendingDelete =
                          chorePendingDeleteId === chore.id;
                        const isDeleting = deletingChoreId === chore.id;

                        const cardTone =
                          index % 3 === 0
                            ? "border-[rgba(196,168,129,0.22)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(255,248,238,0.96))]"
                            : index % 3 === 1
                              ? "border-[rgba(119,154,196,0.20)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(244,250,255,0.96))]"
                              : "border-[rgba(126,171,139,0.20)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(245,252,246,0.96))]";

                        return (
                          <article
                            key={chore.id}
                            className={`rounded-[1.75rem] border p-5 shadow-sm transition-opacity ${
                              chore.is_active
                                ? cardTone
                                : "border-[var(--border-soft)] bg-[var(--panel-muted)] opacity-75"
                            }`}
                          >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  {chore.category && (
                                    <ChoreCategoryBadge
                                      categoryKey={chore.category}
                                    />
                                  )}

                                  <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                                    {chore.kid_name || "Unassigned"}
                                  </span>

                                  <span className="rounded-full border border-[var(--border-soft)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                                    {formatRecurrenceLabel(
                                      chore.recurrence_type
                                    )}
                                  </span>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      chore.is_active
                                        ? "bg-[var(--success-soft)] text-[var(--success-text)]"
                                        : "bg-[var(--panel-soft)] text-[var(--muted-strong)]"
                                    }`}
                                  >
                                    {chore.is_active ? "Active" : "Inactive"}
                                  </span>
                                </div>

                                <h3 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
                                  {chore.title}
                                </h3>

                                {chore.description && (
                                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                                    {chore.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--star-border)] bg-[var(--star-soft)] px-4 py-3">
                                <span className="text-xl">★</span>

                                <div>
                                  <p className="text-lg font-bold leading-none text-[var(--star-text)]">
                                    {chore.star_value}
                                  </p>

                                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--star-text)]">
                                    stars
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isPendingDelete ? (
                              <div className="mt-5 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                                <p className="text-sm font-medium text-[var(--danger-text)]">
                                  Delete “{chore.title}” permanently?
                                </p>

                                <p className="mt-1 text-sm leading-6 text-[var(--danger-text)]">
                                  This cannot be undone.
                                </p>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleDeleteChore(chore.id)
                                    }
                                    disabled={isDeleting}
                                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--danger-button)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--danger-button-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isDeleting
                                      ? "Deleting…"
                                      : "Yes, delete chore"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setChorePendingDeleteId(null)}
                                    disabled={isDeleting}
                                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Keep chore
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingChore(chore)}
                                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--panel-soft)]"
                                >
                                  Edit chore
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    cancelEditingChore();
                                    setChorePendingDeleteId(chore.id);
                                  }}
                                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--danger-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors hover:bg-[var(--danger-soft)]"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section
                  ref={choreFormRef}
                  className="h-fit rounded-[1.75rem] border border-[var(--border-soft)] bg-white/84 p-5 shadow-[0_12px_30px_rgba(31,41,55,0.06)] backdrop-blur sm:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                    {editingMode ? "Edit mode" : "Create mode"}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {editingMode ? "Edit chore" : "Add a chore"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {editingMode
                      ? "Update the details below, then save your changes."
                      : "Create clear tasks that helpers can understand and complete."}
                  </p>

                  {editingMode ? (
                    <ChoreForm
                      mode="edit"
                      kids={kids}
                      kidId={editingKidId}
                      title={editingTitle}
                      description={editingDescription}
                      starValue={editingStarValue}
                      category={editingCategory}
                      recurrenceType={editingRecurrenceType}
                      isActive={editingIsActive}
                      submitLabel={
                        savingChore ? "Saving…" : "Save changes"
                      }
                      onSubmit={handleUpdateChore}
                      onKidChange={setEditingKidId}
                      onTitleChange={setEditingTitle}
                      onDescriptionChange={setEditingDescription}
                      onStarValueChange={setEditingStarValue}
                      onCategoryChange={setEditingCategory}
                      onRecurrenceTypeChange={setEditingRecurrenceType}
                      onActiveChange={setEditingIsActive}
                      onCancel={cancelEditingChore}
                      titleInputRef={choreTitleInputRef}
                    />
                  ) : (
                    <ChoreForm
                      mode="create"
                      kids={kids}
                      kidId={newKidId}
                      title={newTitle}
                      description={newDescription}
                      starValue={newStarValue}
                      category={newCategory}
                      recurrenceType={newRecurrenceType}
                      isActive={newIsActive}
                      submitLabel={savingChore ? "Adding chore…" : "Add chore"}
                      onSubmit={handleCreateChore}
                      onKidChange={setNewKidId}
                      onTitleChange={setNewTitle}
                      onDescriptionChange={setNewDescription}
                      onStarValueChange={setNewStarValue}
                      onCategoryChange={setNewCategory}
                      onRecurrenceTypeChange={setNewRecurrenceType}
                      onActiveChange={setNewIsActive}
                      titleInputRef={choreTitleInputRef}
                    />
                  )}
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}