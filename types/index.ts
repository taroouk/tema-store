import type { ReactNode } from "react";

/**
 * Base Props
 */

export interface ChildrenProps {
  children: ReactNode;
}

export interface ClassNameProps {
  className?: string;
}

export interface ComponentProps extends ChildrenProps, ClassNameProps {}

/**
 * Navigation
 */

export interface NavItem {
  title: string;
  href: string;
}

/**
 * Buttons
 */

export interface ButtonLink {
  label: string;
  href: string;
}

/**
 * Images
 */

export interface ImageResource {
  src: string;
  alt: string;
  width: number;
  height: number;
}