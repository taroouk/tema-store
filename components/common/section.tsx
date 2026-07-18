import type { ElementType } from "react";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "@/types";

interface SectionProps extends ComponentProps {
  as?: ElementType;
  id?: string;
}

export function Section({
  as: Component = "section",
  id,
  className,
  children,
}: SectionProps) {
  return (
    <Component
      id={id}
      className={cn(
        "relative w-full",
        className
      )}
    >
      {children}
    </Component>
  );
}