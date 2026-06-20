import { Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div>
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-5">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
