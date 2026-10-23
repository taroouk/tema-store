export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 rounded bg-neutral-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-lg bg-neutral-200" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-neutral-200" />
    </div>
  );
}
