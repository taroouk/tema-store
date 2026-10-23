import Link from "next/link";

export function EmptyState({ filtered, basePath }: { filtered: boolean; basePath: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 px-8 py-24 text-center">
      <h2 className="text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        {filtered ? "No products match your filters." : "Nothing here yet."}
      </h2>
      <p className="mt-4 max-w-md leading-8 text-neutral-500">
        {filtered ? "Try removing a filter or widening the price range." : "New pieces are on the way — check back soon."}
      </p>
      {filtered && (
        <Link href={basePath} className="mt-8 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:bg-neutral-800">
          Clear filters
        </Link>
      )}
    </div>
  );
}
