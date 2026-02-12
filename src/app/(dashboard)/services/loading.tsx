export default function ServicesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="h-8 w-64 bg-zinc-200 rounded mb-3" />
        <div className="h-4 w-96 bg-zinc-100 rounded" />
      </div>

      {/* Service tier cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 flex flex-col">
            {/* Icon & name */}
            <div className="flex items-start gap-4 mb-4">
              <div className="h-11 w-11 bg-zinc-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-zinc-200 rounded" />
                <div className="h-4 w-full bg-zinc-100 rounded" />
              </div>
            </div>
            {/* Price */}
            <div className="mb-6">
              <div className="h-9 w-24 bg-zinc-200 rounded" />
            </div>
            {/* Features */}
            <div className="space-y-3 mb-8 flex-1">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="flex items-center gap-2.5">
                  <div className="h-4 w-4 bg-zinc-100 rounded" />
                  <div className="h-3 w-48 bg-zinc-100 rounded" />
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className="h-12 bg-zinc-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
