const DashboardSkeleton = () => {
  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-end">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-3 xl:grid-cols-12">
        <div className="h-80 animate-pulse rounded-xl bg-muted xl:col-span-7" />
        <div className="h-80 animate-pulse rounded-xl bg-muted xl:col-span-5" />
      </div>

      {/* Bottom */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;