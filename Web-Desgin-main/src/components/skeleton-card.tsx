// Skeleton card used while products are loading from the backend
import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="mt-2 flex items-baseline gap-2">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    </article>
  );
}

export function SkeletonCardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProductDetail() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Skeleton className="h-4 w-28" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="size-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-12 w-full rounded-lg col-span-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
