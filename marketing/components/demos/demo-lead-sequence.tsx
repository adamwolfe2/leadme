export function DemoLeadSequence() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Automated Lead Sequences</h3>
        <p className="text-gray-600">Multi-touch campaigns that convert</p>
      </div>

      <div className="flex items-center justify-center gap-4 overflow-x-auto">
        {[
          { day: "Day 1", action: "Email", status: "Sent" },
          { day: "Day 3", action: "Follow-up", status: "Opened" },
          { day: "Day 5", action: "LinkedIn", status: "Pending" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="bg-white border-2 border-[#007AFF] rounded-lg p-4 min-w-[120px] text-center">
              <div className="text-xs text-gray-600 mb-1">{step.day}</div>
              <div className="text-sm text-gray-900 mb-1">{step.action}</div>
              <div className="text-xs px-2 py-1 bg-blue-100 text-[#007AFF] rounded">
                {step.status}
              </div>
            </div>
            {i < 2 && (
              <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="text-sm text-gray-900 mb-4">Sequence Performance</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl text-gray-900">87%</div>
            <div className="text-xs text-gray-600">Open Rate</div>
          </div>
          <div>
            <div className="text-xl text-gray-900">42%</div>
            <div className="text-xs text-gray-600">Reply Rate</div>
          </div>
          <div>
            <div className="text-xl text-gray-900">18%</div>
            <div className="text-xs text-gray-600">Booked</div>
          </div>
        </div>
      </div>
    </div>
  )
}
