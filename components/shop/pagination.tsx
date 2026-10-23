import Link from "next/link";

export function ShopPagination({
  basePath,
  page,
  pages,
  params,
}: {
  basePath: string;
  page: number;
  pages: number;
  params: URLSearchParams;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const next = new URLSearchParams(params.toString());
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm hover:border-foreground">
          Previous
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm ${p === page ? "border-foreground bg-foreground text-background" : "border-neutral-300 hover:border-foreground"}`}
        >
          {p}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm hover:border-foreground">
          Next
        </Link>
      )}
    </nav>
  );
}
