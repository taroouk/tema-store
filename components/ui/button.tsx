import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-full",
    "text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-black/20",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-black text-white hover:bg-neutral-800 active:scale-[0.98]",
        secondary:
          "bg-neutral-100 text-black hover:bg-neutral-200 active:scale-[0.98]",
        outline:
          "border border-neutral-300 bg-white hover:bg-neutral-100 active:scale-[0.98]",
        ghost:
          "hover:bg-neutral-100 active:scale-[0.98]",
      },

      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8",
        icon: "h-11 w-11",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}