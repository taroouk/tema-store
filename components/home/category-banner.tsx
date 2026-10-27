import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface CategoryBannerProps {
  title: string;
  href: string;
  image: string;
  className?: string;
}

export function CategoryBanner({
  title,
  href,
  image,
  className,
}: CategoryBannerProps) {
  return (
    <article
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-xl",
        className
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/50" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
        <h2 className="text-xl font-semibold uppercase tracking-[0.1em] text-white md:text-2xl">{title}</h2>

        {/* The whole card is clickable through this link's stretched ::after */}
        <Link
          href={href}
          aria-label={`Shop ${title}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:bg-white group-hover:text-black"
        >
          Shop
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}