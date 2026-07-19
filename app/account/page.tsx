import Link from "next/link";

import { Container } from "@/components/common/container";

export default function AccountPage() {
  return (
    <Container>
      <section className="py-16">
        <div className="mb-12">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Your Account
          </span>

          <h1
            className="text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Account
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 px-8 py-24 text-center">
          <h2
            className="text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Account features coming soon.
          </h2>

          <p className="mt-5 max-w-md leading-8 text-neutral-500">
            Manage your orders, addresses and preferences here. For now,
            continue exploring our collection.
          </p>

          <Link
            href="/men"
            className="mt-10 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </Container>
  );
}
