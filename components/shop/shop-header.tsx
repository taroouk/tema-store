import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/common/container";

interface ShopHeaderProps {
  title: string;
  description: string;
}

export function ShopHeader({
  title,
  description,
}: ShopHeaderProps) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50">
      <Container>
        <div className="flex min-h-[280px] flex-col justify-center py-16">
          {/* Breadcrumb */}

          <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
            <Link
              href="/"
              className="transition hover:text-black"
            >
              Home
            </Link>

            <ChevronRight size={14} />

            <span className="text-black">
              {title}
            </span>
          </div>

          {/* Title */}

          <h1
            className="text-5xl md:text-6xl"
            style={{
              fontFamily: "var(--font-heading)",
            }}
          >
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}