export default function PreferencesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-16 bg-zinc-200 rounded" />
          <div className="h-4 w-3 bg-zinc-100 rounded" />
          <div className="h-4 w-20 bg-zinc-200 rounded" />
        </div>
        <div className="h-8 w-56 bg-zinc-200 rounded mb-2" />
        <div className="h-4 w-80 bg-zinc-100 rounded" />
      </div>

      {/* Info box */}
      <div className="h-24 rounded-lg border border-zinc-200 bg-zinc-50" />

      {/* Form sections */}
      <div className="space-y-6">
        {/* Industries */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="h-5 w-28 bg-zinc-200 rounded mb-2" />
          <div className="h-4 w-64 bg-zinc-100 rounded mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-24 bg-zinc-100 rounded-full" />
            ))}
          </div>
        </div>

        {/* States */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="h-5 w-20 bg-zinc-200 rounded mb-2" />
          <div className="h-4 w-48 bg-zinc-100 rounded mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-8 w-20 bg-zinc-100 rounded-full" />
            ))}
          </div>
        </div>

        {/* Lead caps */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="h-5 w-24 bg-zinc-200 rounded mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 w-16 bg-zinc-100 rounded mb-2" />
                <div className="h-10 bg-zinc-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="h-11 w-32 bg-zinc-200 rounded-lg" />
    </div>
  )
}
