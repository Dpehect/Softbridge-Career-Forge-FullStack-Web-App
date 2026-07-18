import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="product-page"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading workspace</span>
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
