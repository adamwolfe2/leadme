export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-zinc-200 rounded" />
        <div className="h-9 w-32 bg-zinc-200 rounded" />
      </div>
      <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-zinc-200 rounded-full" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-zinc-200 rounded" />
                <div className="h-3 w-44 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
