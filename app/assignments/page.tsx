"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type HouseholdMemberLookup = {
  household_id: string;
};

type RecurrenceType = "one_off" | "daily" | "weekly" | "biweekly";

type Kid = {
  id: string;
  name: string;
};

type Chore = {
  id: string;
  title: string;
  is_active: boolean;
  recurrence_type: RecurrenceType;
};

type AssignmentRow = {
  id: string;
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
  kids: { name: string } | { name: string }[] | null;
  chores:
    | { title: string; recurrence_type: RecurrenceType }
    | { title: string; recurrence_type: RecurrenceType }[]
    | null;
};

type Assignment = {
  id: string;
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
  kid_name: string;
  chore_title: string;
  recurrence_type: RecurrenceType | null;
};

type AssignmentInsert = {
  household_id: string;
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
};

type AssignmentUpdate = {
  kid_id: string;
  chore_id: string;
  status: string;
  assigned_for_date: string | null;
  notes: string | null;
};

function getRelatedName(
  relation:
    | { name?: string; title?: string }
    | { name?: string; title?: string }[]
    | null,
  key: "name" | "title"
) {
  if (!relation) return "";
  if (Array.isArray(relation)) {
    return relation[0]?.[key] ?? "";
  }
  return relation[key] ?? "";
}

function getRelatedRecurrenceType(
  relation:
    | { recurrence_type?: RecurrenceType }
    | { recurrence_type?: RecurrenceType }[]
    | null
) {
  if (!relation) return null;
  if (Array.isArray(relation)) {
    return relation[0]?.recurrence_type ?? null;
  }
  return relation.recurrence_type ?? null;
}

function formatRecurrenceLabel(recurrenceType: RecurrenceType | null) {
  switch (recurrenceType) {
    case "one_off":
      return "One-off";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Every other week";
    default:
      return "Unknown";
  }
}

function getFriendlyAssignmentError(
  error: { code?: string; message?: string } | null
) {
  if (!error) return "Something went wrong.";

  if (
    error.code === "23505" ||
    error.message?.includes("chore_assignments_unique_kid_chore_date_idx")
  ) {
    return "This assignment already exists.";
  }

  return error.message || "Something went wrong.";
}

export default function AssignmentsPage() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [newKidId, setNewKidId] = useState("");
  const [newChoreId, setNewChoreId] = useState("");
  const [newStatus, setNewStatus] = useState("assigned");
  const [newAssignedForDate, setNewAssignedForDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null
  );
  const [editingKidId, setEditingKidId] = useState("");
  const [editingChoreId, setEditingChoreId] = useState("");
  const [editingStatus, setEditingStatus] = useState("assigned");
  const [editingAssignedForDate, setEditingAssignedForDate] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  const [assignmentPendingDeleteId, setAssignmentPendingDeleteId] = useState<
    string | null
  >(null);

  function normalizeAssignment(row: AssignmentRow): Assignment {
    return {
      id: row.id,
      household_id: row.household_id,
      kid_id: row.kid_id,
      chore_id: row.chore_id,
      status: row.status,
      assigned_for_date: row.assigned_for_date,
      notes: row.notes,
      kid_name: getRelatedName(row.kids, "name"),
      chore_title: getRelatedName(row.chores, "title"),
      recurrence_type: getRelatedRecurrenceType(row.chores),
    };
  }

  useEffect(() => {
    async function loadPageData() {
      setLoading(true);
      setPageError("");
      setMessage("");
      setFormError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setPageError("You are not logged in.");
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
        setPageError(memberError.message);
        setLoading(false);
        return;
      }

      if (!typedMemberRow?.household_id) {
        setPageError("No household found for this user.");
        setLoading(false);
        return;
      }

      const hid = typedMemberRow.household_id;
      setHouseholdId(hid);

      const [
        { data: kidRows, error: kidsError },
        { data: choreRows, error: choresError },
        { data: assignmentRows, error: assignmentsError },
      ] = await Promise.all([
        supabase
          .from("kids")
          .select("id, name")
          .eq("household_id", hid)
          .order("name", { ascending: true }),
        supabase
          .from("chores")
          .select("id, title, is_active, recurrence_type")
          .eq("household_id", hid)
          .eq("is_active", true)
          .order("title", { ascending: true }),
        supabase
          .from("chore_assignments")
          .select(`
            id,
            household_id,
            kid_id,
            chore_id,
            status,
            assigned_for_date,
            notes,
            kids!chore_assignments_kid_id_fkey(name),
            chores!chore_assignments_chore_id_fkey(title, recurrence_type)
          `)
          .eq("household_id", hid)
          .order("created_at", { ascending: false }),
      ]);

      if (kidsError) {
        setPageError(kidsError.message);
        setLoading(false);
        return;
      }

      if (choresError) {
        setPageError(choresError.message);
        setLoading(false);
        return;
      }

      if (assignmentsError) {
        setPageError(assignmentsError.message);
        setLoading(false);
        return;
      }

      setKids((kidRows as Kid[]) || []);
      setChores((choreRows as Chore[]) || []);
      setAssignments(
        ((assignmentRows as AssignmentRow[]) || []).map(normalizeAssignment)
      );
      setLoading(false);
    }

    loadPageData();
  }, [supabase]);

  async function handleCreateAssignment(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setFormError("");
    setMessage("");

    if (!householdId) {
      setFormError("Household not loaded yet.");
      return;
    }

    if (!newKidId) {
      setFormError("Please choose a kid.");
      return;
    }

    if (!newChoreId) {
      setFormError("Please choose a chore.");
      return;
    }

    const selectedChore = chores.find((chore) => chore.id === newChoreId);

    if (!selectedChore) {
      setFormError("Selected chore was not found.");
      return;
    }

    const recurrenceType = selectedChore.recurrence_type;
    const requiresDate =
      recurrenceType === "weekly" || recurrenceType === "biweekly";

    if (requiresDate && !newAssignedForDate) {
      setFormError("Please choose a date for weekly or biweekly chores.");
      return;
    }

    const payload = {
      household_id: householdId,
      kid_id: newKidId,
      chore_id: newChoreId,
      status: newStatus,
      assigned_for_date: newAssignedForDate || null,
      notes: newNotes.trim() || null,
    } as AssignmentInsert;

    const { data, error: insertError } = await supabase
      .from("chore_assignments")
      .insert(payload as never)
      .select(`
        id,
        household_id,
        kid_id,
        chore_id,
        status,
        assigned_for_date,
        notes,
        kids!chore_assignments_kid_id_fkey(name),
        chores!chore_assignments_chore_id_fkey(title, recurrence_type)
      `)
      .single();

    if (insertError) {
      setFormError(getFriendlyAssignmentError(insertError));
      return;
    }

    setAssignments((prev) => [
      normalizeAssignment(data as AssignmentRow),
      ...prev,
    ]);
    setNewKidId("");
    setNewChoreId("");
    setNewStatus("assigned");
    setNewAssignedForDate("");
    setNewNotes("");
    setFormError("");
    setMessage("Assignment added.");
  }

  function startEditingAssignment(assignment: Assignment) {
    setAssignmentPendingDeleteId(null);
    setEditingAssignmentId(assignment.id);
    setEditingKidId(assignment.kid_id);
    setEditingChoreId(assignment.chore_id);
    setEditingStatus(assignment.status);
    setEditingAssignedForDate(assignment.assigned_for_date ?? "");
    setEditingNotes(assignment.notes ?? "");
    setFormError("");
    setMessage("");
  }

  function cancelEditingAssignment() {
    setEditingAssignmentId(null);
    setEditingKidId("");
    setEditingChoreId("");
    setEditingStatus("assigned");
    setEditingAssignedForDate("");
    setEditingNotes("");
    setFormError("");
  }

  async function handleUpdateAssignment(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setFormError("");
    setMessage("");

    if (!householdId || !editingAssignmentId) {
      setFormError("No assignment selected for editing.");
      return;
    }

    if (!editingKidId) {
      setFormError("Please choose a kid.");
      return;
    }

    if (!editingChoreId) {
      setFormError("Please choose a chore.");
      return;
    }

    const selectedChore = chores.find((chore) => chore.id === editingChoreId);

    if (!selectedChore) {
      setFormError("Selected chore was not found.");
      return;
    }

    const recurrenceType = selectedChore.recurrence_type;
    const requiresDate =
      recurrenceType === "weekly" || recurrenceType === "biweekly";

    if (requiresDate && !editingAssignedForDate) {
      setFormError("Please choose a date for weekly or biweekly chores.");
      return;
    }

    const payload = {
      kid_id: editingKidId,
      chore_id: editingChoreId,
      status: editingStatus,
      assigned_for_date: editingAssignedForDate || null,
      notes: editingNotes.trim() || null,
    } as AssignmentUpdate;

    const { data, error: updateError } = await supabase
      .from("chore_assignments")
      .update(payload as never)
      .eq("id", editingAssignmentId)
      .eq("household_id", householdId)
      .select(`
        id,
        household_id,
        kid_id,
        chore_id,
        status,
        assigned_for_date,
        notes,
        kids!chore_assignments_kid_id_fkey(name),
        chores!chore_assignments_chore_id_fkey(title, recurrence_type)
      `)
      .single();

    if (updateError) {
      setFormError(getFriendlyAssignmentError(updateError));
      return;
    }

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === editingAssignmentId
          ? normalizeAssignment(data as AssignmentRow)
          : assignment
      )
    );

    setMessage("Assignment updated.");
    cancelEditingAssignment();
  }

  async function handleDeleteAssignment(id: string) {
    setPageError("");
    setMessage("");
    setFormError("");

    if (!householdId) {
      setPageError("Household not loaded yet.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("chore_assignments")
      .delete()
      .eq("id", id)
      .eq("household_id", householdId);

    if (deleteError) {
      setPageError(deleteError.message);
      return;
    }

    setAssignments((prev) =>
      prev.filter((assignment) => assignment.id !== id)
    );
    setAssignmentPendingDeleteId(null);
    setMessage("Assignment deleted.");
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 text-neutral-900">
        Loading assignments...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Assignments
            </h1>
            <p className="mt-2 text-sm text-neutral-700">
              Assign chores to kids in your household.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-200"
            >
              Back to home
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-200"
            >
              Back to manage household
            </button>
          </div>
        </div>

{pageError && pageError === "You are not logged in." && (
  <div className="mt-5">
    <Link
      href="/login"
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
    >
      Log in to your household
    </Link>
  </div>
)}

        {message && <p className="mt-6 text-sm text-green-600">{message}</p>}
        {pageError && <p className="mt-6 text-sm text-red-600">{pageError}</p>}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">
            Current assignments
          </h2>

          {assignments.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">
              No assignments yet. Create one below.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {assignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-start justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {assignment.kid_name} → {assignment.chore_title}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {formatRecurrenceLabel(assignment.recurrence_type)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {assignment.status}
                      {assignment.assigned_for_date
                        ? ` · ${assignment.assigned_for_date}`
                        : " · No date"}
                    </p>

                    {assignment.notes && (
                      <p className="mt-1 text-xs text-neutral-600">
                        {assignment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {assignmentPendingDeleteId === assignment.id ? (
                      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                        <span className="text-xs text-red-700">
                          Are you sure you want to delete this assignment?
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteAssignment(assignment.id)
                          }
                          className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white transition-colors duration-200 hover:bg-red-700 active:bg-red-800"
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setAssignmentPendingDeleteId(null)
                          }
                          className="rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            startEditingAssignment(assignment)
                          }
                          className="rounded-xl border border-neutral-300 px-3 py-1 text-xs text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            cancelEditingAssignment();
                            setAssignmentPendingDeleteId(assignment.id);
                          }}
                          className="rounded-xl border border-red-300 px-3 py-1 text-xs text-red-700 transition-colors duration-200 hover:bg-red-50 active:bg-red-100"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!editingAssignmentId && (
          <section className="mt-10 border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Add assignment
            </h2>

            {kids.length === 0 || chores.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-600">
                You need at least one kid and one active chore before creating
                assignments.
              </p>
            ) : (
              <form
                onSubmit={handleCreateAssignment}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Kid
                  </label>
                  <select
                    value={newKidId}
                    onChange={(e) => setNewKidId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                  >
                    <option value="">Select a kid</option>
                    {kids.map((kid) => (
                      <option key={kid.id} value={kid.id}>
                        {kid.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Chore
                  </label>
                  <select
                    value={newChoreId}
                    onChange={(e) => setNewChoreId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                  >
                    <option value="">Select a chore</option>
                    {chores.map((chore) => (
                      <option key={chore.id} value={chore.id}>
                        {chore.title} ({formatRecurrenceLabel(chore.recurrence_type)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="done">Done</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Assigned for date (optional for daily / one-off)
                  </label>
                  <input
                    type="date"
                    value={newAssignedForDate}
                    onChange={(e) => setNewAssignedForDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={4}
                    placeholder="Optional details for this assignment"
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-500"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-neutral-900 px-5 py-3 text-white transition-colors duration-200 hover:bg-neutral-800 active:bg-neutral-950"
                  >
                    Add Assignment
                  </button>

                  {(formError || message) && (
                    <div
                      className={`min-h-[52px] flex-1 rounded-2xl border px-4 py-3 text-sm flex items-center ${
                        formError
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-green-200 bg-green-50 text-green-700"
                      }`}
                    >
                      {formError || message}
                    </div>
                  )}
                </div>
              </form>
            )}
          </section>
        )}

        {editingAssignmentId && (
          <section className="mt-10 border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Edit assignment
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Update the assignment details below, or cancel to return to add
              mode.
            </p>

            <form
              onSubmit={handleUpdateAssignment}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Kid
                </label>
                <select
                  value={editingKidId}
                  onChange={(e) => setEditingKidId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                >
                  <option value="">Select a kid</option>
                  {kids.map((kid) => (
                    <option key={kid.id} value={kid.id}>
                      {kid.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Chore
                </label>
                <select
                  value={editingChoreId}
                  onChange={(e) => setEditingChoreId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                >
                  <option value="">Select a chore</option>
                  {chores.map((chore) => (
                    <option key={chore.id} value={chore.id}>
                      {chore.title} ({formatRecurrenceLabel(chore.recurrence_type)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Status
                </label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                >
                  <option value="assigned">Assigned</option>
                  <option value="done">Done</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Assigned for date (optional for daily / one-off)
                </label>
                <input
                  type="date"
                  value={editingAssignedForDate}
                  onChange={(e) => setEditingAssignedForDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Notes (optional)
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-900 px-5 py-3 text-sm text-white transition-colors duration-200 hover:bg-neutral-800 active:bg-neutral-950"
                  >
                    Save changes
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditingAssignment}
                    className="rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 active:bg-neutral-200"
                  >
                    Cancel
                  </button>
                </div>

                {(formError || message) && (
                  <div
                    className={`min-h-[52px] flex-1 rounded-2xl border px-4 py-3 text-sm flex items-center ${
                      formError
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {formError || message}
                  </div>
                )}
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}