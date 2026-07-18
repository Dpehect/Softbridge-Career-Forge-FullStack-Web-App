export default function Loading() {
  return (
    <div
      className="grid min-h-[60vh] place-items-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <span className="block h-10 w-10 animate-spin rounded-full border-[3px] border-line-strong border-t-[#3b82f6]" />
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/20" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold text-ink">CareerForge</p>
          <p className="text-xs text-ink-3">Loading workspace…</p>
        </div>
        <div className="mt-2 w-48 space-y-2">
          <div className="h-2 rounded-full skeleton-shimmer" />
          <div className="h-2 w-2/3 mx-auto rounded-full skeleton-shimmer" />
        </div>
      </div>
      <span className="sr-only">Loading workspace</span>
    </div>
  );
}
