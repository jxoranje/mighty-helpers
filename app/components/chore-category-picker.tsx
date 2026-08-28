"use client";

import Image from "next/image";
import {
  CHORE_CATEGORY_LIST,
  getChoreCategory,
  choreCategoryColorClasses,
  type ChoreCategoryKey,
} from "@/lib/chore-categories";

// Read-only badge: drop this anywhere you currently render a chore row
// to show its category icon + label.
export function ChoreCategoryBadge({ categoryKey }: { categoryKey: string | null | undefined }) {
  const category = getChoreCategory(categoryKey);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${choreCategoryColorClasses(
        category.color
      )}`}
    >
      <Image src={category.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
      {category.label}
    </span>
  );
}

// Interactive picker: drop this into your add/edit chore form.
// value/onChange follow the same pattern as your other controlled inputs.
export function ChoreCategoryPicker({
  value,
  onChange,
}: {
  value: ChoreCategoryKey | string | null;
  onChange: (key: ChoreCategoryKey) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {CHORE_CATEGORY_LIST.map((category) => {
        const isSelected = value === category.key;

        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            aria-pressed={isSelected}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 ${
              isSelected
                ? `${choreCategoryColorClasses(category.color)} border-2 shadow-sm`
                : "border-[var(--border-soft)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)]"
            }`}
          >
            <Image
              src={category.icon}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="text-[11px] font-medium leading-tight">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
