"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Container } from "@/components/common/container";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <section className="flex flex-col items-center justify-center py-32 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Something went wrong
        </span>

        <h1
          className="mt-4 text-5xl font-semibold md:text-6xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Unexpected Error
        </h1>

        <p className="mt-5 max-w-md leading-8 text-neutral-500">
          An error occurred while loading this page. Please try again.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-full border border-neutral-300 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-neutral-100"
          >
            Back To Home
          </Link>
        </div>
      </section>
    </Container>
  );
}
