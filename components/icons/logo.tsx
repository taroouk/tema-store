import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * "black" = the dark logo for light backgrounds, "white" = the light logo for dark backgrounds.
   * Both are rendered and swapped with CSS so the correct one shows in either theme.
   */
  variant?: "black" | "white";
  /** Size of the box the logo is fitted into. Any logo proportions work: the image is never stretched. */
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  align?: "left" | "center";
}

const LIGHT_BG_LOGO = "/logos/tema-black.png";
const DARK_BG_LOGO = "/logos/tema-white.png";

export function Logo({ variant = "black", width = 120, height = 40, priority = false, className, align = "center" }: LogoProps) {
  const fit = cn("select-none object-contain", align === "left" ? "object-left" : "object-center");
  const box = { width, height };

  // Always-dark surfaces (e.g. over photography) keep a fixed variant.
  if (variant === "white") {
    return (
      <span className={cn("relative inline-block", className)} style={box}>
        <Image src={DARK_BG_LOGO} alt="Tema Label" fill sizes={`${width}px`} priority={priority} className={fit} />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block", className)} style={box}>
      <Image src={LIGHT_BG_LOGO} alt="Tema Label" fill sizes={`${width}px`} priority={priority} className={cn(fit, "dark:hidden")} />
      <Image src={DARK_BG_LOGO} alt="" aria-hidden fill sizes={`${width}px`} priority={priority} className={cn(fit, "hidden dark:block")} />
    </span>
  );
}
