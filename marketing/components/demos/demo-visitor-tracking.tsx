export function DemoVisitorTracking() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Visitor Tracking</h3>
        <p className="text-gray-600">Identify and track every website visitor in real-time</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { company: "Acme Corp", visitors: "12", intent: "High" },
          { company: "TechStart Inc", visitors: "8", intent: "Medium" },
          { company: "GrowthCo", visitors: "15", intent: "High" },
        ].map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-900 mb-2">{item.company}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{item.visitors} visitors</span>
              <span className={`px-2 py-1 rounded ${
                item.intent === "High" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
              }`}>
                {item.intent} Intent
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="text-sm text-gray-900 mb-3">Real-time Activity</div>
        <div className="space-y-2">
          {["Viewing pricing page", "Downloaded whitepaper", "Visited careers page"].map((activity, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {activity}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
