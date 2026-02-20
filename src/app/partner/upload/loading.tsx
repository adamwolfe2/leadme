export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 bg-zinc-200 rounded" />
      <div className="bg-white border border-zinc-200 rounded-lg p-8 space-y-4">
        <div className="h-40 w-full bg-zinc-100 rounded-lg border-2 border-dashed border-zinc-200" />
        <div className="h-5 w-64 bg-zinc-200 rounded mx-auto" />
        <div className="h-4 w-48 bg-zinc-100 rounded mx-auto" />
      </div>
    </div>
  )
}
