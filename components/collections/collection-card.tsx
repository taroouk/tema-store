import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Collection } from "@/constants/collections";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100"
    >
      <Image
        src={collection.coverImage}
        alt={collection.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-8">
        <h2
          className="text-3xl font-semibold text-white md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {collection.title}
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
          {collection.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] text-white/70">
            {collection.productSlugs.length} items
          </span>

          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all group-hover:gap-3">
            Explore
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
