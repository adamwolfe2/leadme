export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 bg-zinc-200 rounded" />
      <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
        <div className="h-5 w-32 bg-zinc-200 rounded" />
        <div className="h-4 w-full bg-zinc-100 rounded" />
        <div className="h-24 w-full bg-zinc-100 rounded" />
        <div className="h-9 w-28 bg-zinc-200 rounded" />
      </div>
    </div>
  )
}
