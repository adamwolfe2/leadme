export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-zinc-200 rounded" />
      <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-6 w-6 bg-zinc-200 rounded-full text-center" />
            <div className="h-9 w-9 bg-zinc-200 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-36 bg-zinc-200 rounded" />
              <div className="h-3 w-24 bg-zinc-100 rounded" />
            </div>
            <div className="h-4 w-20 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
