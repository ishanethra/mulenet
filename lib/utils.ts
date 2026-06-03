import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskBand(score: number) {
  if (score <= 25) return { label: "Safe", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score <= 50) return { label: "Monitor", className: "bg-cyan-50 text-cyan-700 border-cyan-200" };
  if (score <= 75) return { label: "High Risk", className: "bg-amber-50 text-amber-800 border-amber-200" };
  return { label: "Critical", className: "bg-red-50 text-red-700 border-red-200" };
}
