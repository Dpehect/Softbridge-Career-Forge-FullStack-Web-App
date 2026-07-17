export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
      <span className="sr-only">Loading workspace</span>
    </div>
  );
}
