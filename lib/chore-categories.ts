import type { StaticImageData } from "next/image";

import cleaningIcon from "@/app/components/images/chores/cleaning.png";
import makeBedIcon from "@/app/components/images/chores/make_bed.png";
import laundryIcon from "@/app/components/images/chores/laundry.png";
import cookingIcon from "@/app/components/images/chores/cooking.png";
import breakfastIcon from "@/app/components/images/chores/breakfast.png";
import setTableIcon from "@/app/components/images/chores/set_table.png";
import homeworkIcon from "@/app/components/images/chores/homework.png";
import outdoorIcon from "@/app/components/images/chores/outdoor.png";
import washCarIcon from "@/app/components/images/chores/wash_car.png";
import petsIcon from "@/app/components/images/chores/pets.png";
import walkDogIcon from "@/app/components/images/chores/walk_dog.png";
import litterIcon from "@/app/components/images/chores/litter.png";
import selfCareIcon from "@/app/components/images/chores/self_care.png";
import brushedTeethIcon from "@/app/components/images/chores/brushed_teeth.png";
import bathTimeIcon from "@/app/components/images/chores/bath_time.png";
import pottyIcon from "@/app/components/images/chores/potty.png";
import otherIcon from "@/app/components/images/chores/other.png";

export type ChoreCategoryKey =
  | "cleaning"
  | "make_bed"
  | "laundry"
  | "cooking"
  | "breakfast"
  | "set_table"
  | "homework"
  | "outdoor"
  | "wash_car"
  | "pets"
  | "walk_dog"
  | "litter"
  | "self_care"
  | "brushed_teeth"
  | "bath_time"
  | "potty"
  | "other";

export type ChoreCategoryColor =
  | "blue"
  | "orange"
  | "purple"
  | "green"
  | "indigo"
  | "yellow"
  | "pink"
  | "teal"
  | "gray";

export type ChoreCategory = {
  key: ChoreCategoryKey;
  label: string;
  icon: StaticImageData;
  color: ChoreCategoryColor;
};

// Keys must match chore_categories.key in the database and the icon
// filenames in app/components/images/chores/ (without the .png extension).
export const CHORE_CATEGORIES: Record<ChoreCategoryKey, ChoreCategory> = {
  cleaning: { key: "cleaning", label: "Cleaning", icon: cleaningIcon, color: "blue" },
  make_bed: { key: "make_bed", label: "Make Bed", icon: makeBedIcon, color: "purple" },
  laundry: { key: "laundry", label: "Laundry", icon: laundryIcon, color: "indigo" },
  cooking: { key: "cooking", label: "Cooking", icon: cookingIcon, color: "orange" },
  breakfast: { key: "breakfast", label: "Breakfast", icon: breakfastIcon, color: "orange" },
  set_table: { key: "set_table", label: "Set Table", icon: setTableIcon, color: "orange" },
  homework: { key: "homework", label: "Homework", icon: homeworkIcon, color: "teal" },
  outdoor: { key: "outdoor", label: "Outdoor", icon: outdoorIcon, color: "yellow" },
  wash_car: { key: "wash_car", label: "Wash Car", icon: washCarIcon, color: "blue" },
  pets: { key: "pets", label: "Pets", icon: petsIcon, color: "green" },
  walk_dog: { key: "walk_dog", label: "Walk Dog", icon: walkDogIcon, color: "green" },
  litter: { key: "litter", label: "Litter", icon: litterIcon, color: "green" },
  self_care: { key: "self_care", label: "Self-care", icon: selfCareIcon, color: "pink" },
  brushed_teeth: { key: "brushed_teeth", label: "Brush Teeth", icon: brushedTeethIcon,
    color: "pink", },
  bath_time: { key: "bath_time", label: "Bath Time", icon: bathTimeIcon, color: "pink" },
  potty: { key: "potty", label: "Potty", icon: pottyIcon, color: "pink" },
  other: { key: "other", label: "Other", icon: otherIcon, color: "gray" },
};

export const CHORE_CATEGORY_LIST: ChoreCategory[] = Object.values(CHORE_CATEGORIES);

export function getChoreCategory(key: string | null | undefined): ChoreCategory {
  if (key && key in CHORE_CATEGORIES) {
    return CHORE_CATEGORIES[key as ChoreCategoryKey];
  }
  return CHORE_CATEGORIES.other;
}

export function choreCategoryColorClasses(color: ChoreCategoryColor) {
  const map: Record<ChoreCategoryColor, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    green: "bg-green-50 text-green-600 border-green-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200",
    teal: "bg-teal-50 text-teal-600 border-teal-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return map[color];
}
