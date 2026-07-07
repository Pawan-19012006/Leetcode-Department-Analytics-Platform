/**
 * Reusable formatting utilities for LeetCode Department Analytics Platform.
 * Ensures whole numbers, correct signed changes, percentage rounding (max 1 decimal), and clean charts/tables values.
 */

export function formatRating(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Math.round(Number(value)).toString();
}

export function formatRatingChange(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  const num = Math.round(Number(value));
  if (num > 0) return `+${num}`;
  return num.toString();
}

export function formatPercentage(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0%";
  const num = Number(value);
  // Max 1 decimal place
  const rounded = Math.round(num * 10) / 10;
  return `${rounded}%`;
}

export function formatScore(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Math.round(Number(value)).toString();
}
