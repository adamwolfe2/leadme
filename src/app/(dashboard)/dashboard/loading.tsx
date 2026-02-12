export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
      {/* Welcome header card */}
      <div className="rounded-xl bg-zinc-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-zinc-200 rounded" />
            <div className="h-4 w-32 bg-zinc-200 rounded" />
          </div>
          <div className="h-4 w-40 bg-zinc-200 rounded" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-zinc-200 rounded" />
                <div className="h-10 w-16 bg-zinc-200 rounded" />
              </div>
              <div className="h-12 w-12 bg-zinc-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent leads section */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-zinc-200 rounded" />
          <div className="h-4 w-16 bg-zinc-200 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-white">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-zinc-200 rounded" />
                <div className="h-3 w-24 bg-zinc-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-zinc-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-zinc-200 rounded-lg" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-24 bg-zinc-200 rounded" />
                <div className="h-3 w-40 bg-zinc-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
