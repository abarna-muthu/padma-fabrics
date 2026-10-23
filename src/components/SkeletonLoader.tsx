import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#E5DAC4]/60 dark:bg-[#362D30]", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-[#262022] border border-[#E5DAC4] dark:border-[#B8913A]/20 rounded-lg overflow-hidden p-0 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-3/4 w-full bg-[#FAF6EE] dark:bg-[#362D30]" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-1 pt-2">
          <Skeleton className="h-5 w-8 rounded" />
          <Skeleton className="h-5 w-8 rounded" />
          <Skeleton className="h-5 w-8 rounded" />
        </div>
        <Skeleton className="h-9 w-full rounded-md mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 max-w-xl mb-8">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

export default Skeleton;
