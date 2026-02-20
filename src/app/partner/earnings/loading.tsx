export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 bg-zinc-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2">
            <div className="h-4 w-24 bg-zinc-100 rounded" />
            <div className="h-8 w-20 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="h-4 w-40 bg-zinc-100 rounded" />
            <div className="h-4 w-24 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
