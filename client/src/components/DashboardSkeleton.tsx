const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-secondary/60 rounded-lg ${className}`} />
);

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="w-full h-16 border-b border-border/40 flex items-center px-6 gap-4">
        <Shimmer className="w-8 h-8 rounded-full" />
        <Shimmer className="w-32 h-5" />
        <div className="flex-1" />
        <Shimmer className="w-24 h-8 rounded-lg" />
      </div>

      <main className="w-full px-4 sm:px-6 py-6 flex gap-4">
        {/* Sidebar skeleton */}
        <aside className="shrink-0 w-40 space-y-2">
          <Shimmer className="w-full h-10 rounded-xl" />
          <Shimmer className="w-full h-10 rounded-xl" />
          <Shimmer className="w-full h-10 rounded-xl" />
          <Shimmer className="w-full h-10 rounded-xl" />
        </aside>

        {/* Main content skeleton */}
        <div className="flex-1 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shimmer className="w-10 h-10 rounded-lg" />
              <Shimmer className="w-16 h-8 rounded-lg" />
              <Shimmer className="w-10 h-10 rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Shimmer className="w-28 h-10 rounded-lg" />
              <Shimmer className="w-24 h-10 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Planner area */}
            <div className="glass rounded-xl p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="w-14 h-5" />
                  <Shimmer className="flex-1 h-14 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Side panels */}
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 space-y-3">
                <Shimmer className="w-28 h-5" />
                <Shimmer className="w-full h-3" />
                <Shimmer className="w-3/4 h-3" />
                <div className="flex gap-4 mt-3">
                  <Shimmer className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2 pt-2">
                    <Shimmer className="w-full h-3" />
                    <Shimmer className="w-2/3 h-3" />
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-4 space-y-3">
                <Shimmer className="w-32 h-5" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Shimmer className="w-3 h-3 rounded-full" />
                    <Shimmer className="flex-1 h-10 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
