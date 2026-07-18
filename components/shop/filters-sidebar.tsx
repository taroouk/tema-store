export function FiltersSidebar() {
  return (
    <div className="sticky top-28 space-y-10">
      <div>
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">
          Categories
        </h3>

        <div className="space-y-3 text-neutral-600">
          <button className="block transition hover:text-black">
            Oversized Tees
          </button>

          <button className="block transition hover:text-black">
            Basic Tees
          </button>

          <button className="block transition hover:text-black">
            Hoodies
          </button>

          <button className="block transition hover:text-black">
            Pants
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">
          Size
        </h3>

        <div className="flex flex-wrap gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              key={size}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 transition hover:border-black"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">
          Color
        </h3>

        <div className="flex gap-4">
          <span className="h-7 w-7 rounded-full bg-black" />
          <span className="h-7 w-7 rounded-full border bg-white" />
          <span className="h-7 w-7 rounded-full bg-stone-500" />
          <span className="h-7 w-7 rounded-full bg-neutral-400" />
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">
          Price
        </h3>

        <p className="text-neutral-500">
          EGP 299 — EGP 999
        </p>
      </div>
    </div>
  );
}