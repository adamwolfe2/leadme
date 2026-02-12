export default function SignupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-pulse">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-10 w-32 bg-zinc-200 rounded" />
        </div>
        {/* Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="h-7 w-40 bg-zinc-200 rounded mx-auto" />
            <div className="h-4 w-56 bg-zinc-100 rounded mx-auto" />
          </div>
          {/* OAuth button */}
          <div className="h-11 bg-zinc-100 rounded-lg" />
          {/* Divider */}
          <div className="h-px bg-zinc-200" />
          {/* Name field */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-zinc-200 rounded" />
            <div className="h-11 bg-zinc-100 rounded-lg" />
          </div>
          {/* Email field */}
          <div className="space-y-2">
            <div className="h-4 w-12 bg-zinc-200 rounded" />
            <div className="h-11 bg-zinc-100 rounded-lg" />
          </div>
          {/* Password field */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-zinc-200 rounded" />
            <div className="h-11 bg-zinc-100 rounded-lg" />
          </div>
          {/* Submit */}
          <div className="h-11 bg-zinc-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
