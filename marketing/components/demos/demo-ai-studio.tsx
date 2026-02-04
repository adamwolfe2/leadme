export function DemoAIStudio() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">AI Studio</h3>
        <p className="text-gray-600">Train AI on your brand voice and messaging</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="text-sm text-gray-900 mb-4">Brand Workspace</div>
        <div className="space-y-3">
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Company Name</div>
            <div className="text-sm text-gray-900">TechStart Inc</div>
          </div>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Brand Voice</div>
            <div className="text-sm text-gray-900">Professional, friendly, data-driven</div>
          </div>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Target Audience</div>
            <div className="text-sm text-gray-900">B2B SaaS founders</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="text-xs text-[#007AFF] mb-2">AI Generated Email</div>
        <div className="text-sm text-gray-900 mb-2">Hi Sarah,</div>
        <div className="text-sm text-gray-600">
          I noticed TechStart recently raised Series A. Congrats! We help companies like yours scale outbound during growth phases...
        </div>
      </div>
    </div>
  )
}
