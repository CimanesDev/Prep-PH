import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Token-saving utilities
export type MinimalMessage = { role: "user" | "model"; text: string };

export const buildCompactProfile = (raw: any): string => {
  if (!raw) return "unknown";
  const field = raw.field ? String(raw.field) : "";
  const role = raw.role ? String(raw.role) : "";
  const level = raw.level ? String(raw.level) : "";
  const company = raw.company ? String(raw.company) : "";
  return [field, role, level, company].filter(Boolean).join(" | ") || "unknown";
};

export const trimMessages = (msgs: MinimalMessage[], maxItems = 6, maxChars = 280): MinimalMessage[] =>
  msgs.slice(-maxItems).map(m => ({ role: m.role, text: (m.text || "").slice(0, maxChars) }));

export const summarizeMessages = (msgs: MinimalMessage[], maxChars = 360): string => {
  if (msgs.length === 0) return "";
  // Simple heuristic summary to avoid an extra LLM call: keep first and last user/model signal
  const firstUser = msgs.find(m => m.role === "user");
  const lastUser = [...msgs].reverse().find(m => m.role === "user");
  const lastModel = [...msgs].reverse().find(m => m.role === "model");
  const parts = [
    firstUser ? `User goal: ${(firstUser.text || "").slice(0, 160)}` : "",
    lastUser ? `Last answer: ${(lastUser.text || "").slice(0, 160)}` : "",
    lastModel ? `Last question: ${(lastModel.text || "").slice(0, 120)}` : ""
  ].filter(Boolean);
  const summary = parts.join(" | ");
  return summary.slice(0, maxChars);
};