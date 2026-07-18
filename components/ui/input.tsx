import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          "h-12 rounded-xl border border-neutral-300 bg-white px-4 text-sm",
          "transition-colors placeholder:text-neutral-400",
          "focus:border-black focus:outline-none",
          className
        )}
        {...props}
      />
    </div>
  );
}
