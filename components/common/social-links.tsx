import { SOCIAL_ICONS, SOCIAL_LABELS, type SocialKey } from "@/components/icons/social-icons";

/** Round icon buttons for every configured social link (WhatsApp included). */
export function SocialLinks({ links, className = "" }: { links: Partial<Record<SocialKey, string>>; className?: string }) {
  const items = (Object.keys(SOCIAL_ICONS) as SocialKey[]).filter((k) => links[k]);
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((key) => {
        const Icon = SOCIAL_ICONS[key];
        return (
          <li key={key}>
            <a
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={SOCIAL_LABELS[key]}
              title={SOCIAL_LABELS[key]}
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:-translate-y-0.5 hover:border-foreground hover:bg-foreground hover:text-background ${
                key === "whatsapp" ? "hover:!border-[#25D366] hover:!bg-[#25D366] hover:!text-white" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
