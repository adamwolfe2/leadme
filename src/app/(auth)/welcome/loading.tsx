export default function WelcomeLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-pulse">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-10 w-32 bg-zinc-200 rounded" />
        </div>
        {/* Quiz card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
          {/* Progress bar */}
          <div className="h-2 bg-zinc-100 rounded-full">
            <div className="h-2 w-1/4 bg-zinc-200 rounded-full" />
          </div>
          {/* Question */}
          <div className="space-y-3 text-center">
            <div className="h-8 w-72 bg-zinc-200 rounded mx-auto" />
            <div className="h-4 w-96 bg-zinc-100 rounded mx-auto" />
          </div>
          {/* Options */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg border border-zinc-200 bg-zinc-50" />
            ))}
          </div>
          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <div className="h-10 w-24 bg-zinc-100 rounded-lg" />
            <div className="h-10 w-24 bg-zinc-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
