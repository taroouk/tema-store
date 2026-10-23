/** Route-level loading UI: a slim progress bar plus a calm skeleton, never a full-screen splash. */
export function LoadingScreen() {
  return (
    <div role="status" aria-label="Loading" aria-busy="true">
      <div className="fixed inset-x-0 top-0 z-[300] h-0.5 overflow-hidden bg-transparent">
        <div className="h-full w-1/3 animate-[progress_1.1s_ease-in-out_infinite] rounded-full bg-foreground" />
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-8 xl:px-12">
        <div className="ux-loading-bar mb-4 h-4 w-32 rounded-full" />
        <div className="ux-loading-bar mb-12 h-12 w-72 max-w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <div className="ux-loading-bar aspect-[3/4] rounded-2xl" />
              <div className="ux-loading-bar mt-4 h-4 w-2/3 rounded-full" />
              <div className="ux-loading-bar mt-2 h-4 w-1/3 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
