import type { ElementType, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headingVariants = cva(
  "font-semibold tracking-tight",
  {
    variants: {
      size: {
        xs: "text-lg md:text-xl",
        sm: "text-2xl md:text-3xl",
        md: "text-3xl md:text-4xl lg:text-5xl",
        lg: "text-4xl md:text-5xl lg:text-6xl",
        xl: "text-5xl md:text-6xl lg:text-7xl",
      },
      color: {
        default: "text-black",
        muted: "text-neutral-500",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  }
);

interface HeadingProps extends VariantProps<typeof headingVariants> {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Heading({
  as: Component = "h2",
  size,
  color,
  className,
  children,
}: HeadingProps) {
  return (
    <Component
      className={cn(
        headingVariants({
          size,
          color,
        }),
        className
      )}
    >
      {children}
    </Component>
  );
}