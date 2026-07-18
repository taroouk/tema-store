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
        "group relative aspect-[16/10] overflow-hidden rounded-[28px] bg-neutral-100",
        className
      )}
    >
      {/* Image */}
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/55" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
        <h2 className="mb-5 text-3xl font-semibold uppercase tracking-[0.08em] text-white md:text-4xl">
          {title}
        </h2>

        <Link
  href={href}
  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:gap-4"
>
  <span className="text-white">Shop Now</span>

  <ArrowRight
    size={18}
    className="text-white transition-transform duration-300 group-hover:translate-x-1"
  />
</Link>
      </div>
    </article>
  );
}