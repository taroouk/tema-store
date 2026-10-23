"use client";

import { Toaster } from "sonner";

import { useResolvedTheme } from "@/lib/theme";

export function ThemedToaster({ position = "top-center" }: { position?: "top-center" | "top-right" }) {
  const theme = useResolvedTheme();
  return <Toaster position={position} richColors closeButton theme={theme === "dark" ? "dark" : "light"} />;
}
