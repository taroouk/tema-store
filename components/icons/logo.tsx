import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "black" | "white";
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

const logoMap = {
  black: "/logos/tema-black.png",
  white: "/logos/tema-white.png",
} as const;

export function Logo({
  variant = "black",
  width = 120,
  height = 40,
  priority = false,
  className,
}: LogoProps) {
  return (
    <Image
      src={logoMap[variant]}
      alt="TEMA"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}