import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 px-8 py-24 text-center">
      <h2
        className="text-4xl"
        style={{
          fontFamily: "var(--font-heading)",
        }}
      >
        Your cart is empty.
      </h2>

      <p className="mt-5 max-w-md leading-8 text-neutral-500">
        Looks like you haven&apos;t added anything yet.
        Discover our latest collection and find your next favorite piece.
      </p>

      <Link
        href="/men"
        className="mt-10 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
      >
        Continue Shopping
      </Link>
    </div>
  );
}