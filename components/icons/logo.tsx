import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * "black" = the dark logo for light backgrounds, "white" = the light logo for dark backgrounds.
   * Both are rendered and swapped with CSS so the correct one shows in either theme.
   */
  variant?: "black" | "white";
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

const LIGHT_BG_LOGO = "/logos/tema-black.png";
const DARK_BG_LOGO = "/logos/tema-white.png";

export function Logo({
  variant = "black",
  width = 120,
  height = 40,
  priority = false,
  className,
}: LogoProps) {
  const common = { width, height, priority };
  const base = "h-auto w-auto select-none";

  // Always-dark surfaces (e.g. over photography) keep a fixed variant.
  if (variant === "white") {
    return <Image src={DARK_BG_LOGO} alt="Tema Label" {...common} className={cn(base, className)} />;
  }

  return (
    <>
      <Image src={LIGHT_BG_LOGO} alt="Tema Label" {...common} className={cn(base, "dark:hidden", className)} />
      <Image src={DARK_BG_LOGO} {...common} alt="" aria-hidden className={cn(base, "hidden dark:block", className)} />
    </>
  );
}
