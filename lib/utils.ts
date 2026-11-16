import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Admin-uploaded photos live in Supabase Storage. Next's image optimizer gives up on the upstream download after
 * a hard-coded 7s, so big originals 504 and never show. Serve those straight from storage instead.
 */
export const isStorageImage = (src: unknown): boolean =>
  typeof src === "string" && /^https:\/\/[^/]+\.supabase\.co\/storage\//.test(src);
