import type { ElementType } from "react";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "@/types";

interface ContainerProps extends ComponentProps {
  as?: ElementType;
}

export function Container({
  as: Component = "div",
  className,
  children,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-[1440px] px-5 md:px-8 xl:px-12",
        className
      )}
    >
      {children}
    </Component>
  );
}