import Link from "next/link";

import { Container } from "@/components/common/container";

export default function NotFound() {
  return (
    <Container>
      <section className="flex flex-col items-center justify-center py-32 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          404
        </span>

        <h1
          className="mt-4 text-5xl font-semibold md:text-6xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Page Not Found
        </h1>

        <p className="mt-5 max-w-md leading-8 text-neutral-500">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-10 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
        >
          Back To Home
        </Link>
      </section>
    </Container>
  );
}
