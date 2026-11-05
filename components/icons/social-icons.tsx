import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;

export const InstagramIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm5-8.1a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 2.8c-2.5 0-2.8 0-3.8.1-2.6.1-4 1.5-4.2 4.2-.1 1-.1 1.3-.1 3.8s0 2.8.1 3.8c.1 2.6 1.5 4 4.2 4.2 1 .1 1.3.1 3.8.1s2.8 0 3.8-.1c2.6-.1 4-1.5 4.2-4.2.1-1 .1-1.3.1-3.8s0-2.8-.1-3.8c-.1-2.6-1.5-4-4.2-4.2-1-.1-1.3-.1-3.8-.1Zm0 1.7c2.4 0 2.7 0 3.7.1 1.7.1 2.5.9 2.6 2.6.1 1 .1 1.2.1 3.7s0 2.7-.1 3.7c-.1 1.7-.9 2.5-2.6 2.6-1 .1-1.2.1-3.7.1s-2.7 0-3.7-.1c-1.7-.1-2.5-.9-2.6-2.6-.1-1-.1-1.2-.1-3.7s0-2.7.1-3.7c.1-1.7.9-2.5 2.6-2.6 1-.1 1.2-.1 3.7-.1Z" /></svg>
);
export const FacebookIcon = (p: P) => (
  <svg {...base} {...p}><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.8v8h3.2Z" /></svg>
);
export const TikTokIcon = (p: P) => (
  <svg {...base} {...p}><path d="M16.6 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 5 5.7V9a7 7 0 0 0 4 1.3V7.2A4.3 4.3 0 0 1 16.6 3Z" /></svg>
);
export const XIcon = (p: P) => (
  <svg {...base} {...p}><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
);
export const PinterestIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 2.5a9.5 9.5 0 0 0-3.5 18.3c-.1-.8-.2-2 0-2.8l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.300.6 1.300 1.400 0 .9-.5 2.100-.8 3.300-.2 1 .5 1.800 1.500 1.800 1.800 0 3.200-1.900 3.200-4.600 0-2.400-1.700-4.100-4.200-4.100-2.900 0-4.600 2.200-4.600 4.400 0 .9.3 1.800.8 2.300.1.100.1.200.1.300l-.3 1.100c0 .2-.2.200-.4.100-1.300-.6-2.100-2.500-2.100-4 0-3.300 2.400-6.300 6.900-6.300 3.600 0 6.400 2.600 6.400 6 0 3.600-2.300 6.500-5.400 6.500-1 0-2-.5-2.300-1.200l-.6 2.400c-.2.900-.8 1.900-1.300 2.600A9.500 9.500 0 1 0 12 2.500Z" /></svg>
);
export const WhatsAppIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l5-1.3A9.8 9.8 0 1 0 12 2.200Zm0 17.900c-1.500 0-2.900-.4-4.100-1.200l-.3-.2-3 .8.8-2.900-.2-.3a8.100 8.100 0 1 1 6.800 3.800Zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100-1.400-.7-2.300-1.200-3.200-2.800-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.100-.7.300-.7.700-1 1.500-1 2.400.1 1 .5 2 1.200 2.800 1.300 1.800 2.900 3.100 4.900 3.800.9.300 1.600.3 2.200.2.700-.1 1.500-.6 1.700-1.200.2-.6.200-1.100.2-1.200-.1-.1-.3-.2-.5-.3Z" /></svg>
);

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  x: XIcon,
  pinterest: PinterestIcon,
  whatsapp: WhatsAppIcon,
} as const;

export const SOCIAL_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  pinterest: "Pinterest",
  whatsapp: "WhatsApp",
} as const;

export type SocialKey = keyof typeof SOCIAL_ICONS;

export const MailIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
