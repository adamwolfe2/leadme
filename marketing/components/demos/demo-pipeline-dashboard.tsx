export function DemoPipelineDashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Pipeline Dashboard</h3>
        <p className="text-gray-600">Live metrics and deal tracking in one place</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Total Pipeline</div>
          <div className="text-2xl text-gray-900">$2.4M</div>
          <div className="text-xs text-[#007AFF] mt-1">↑ 18% this month</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Conversion Rate</div>
          <div className="text-2xl text-gray-900">24.3%</div>
          <div className="text-xs text-[#007AFF] mt-1">↑ +4.1%</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Active Deals</div>
          <div className="text-2xl text-gray-900">47</div>
          <div className="text-xs text-gray-600 mt-1">12 closing soon</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
            <span className="text-sm text-gray-900">Deal Closed!</span>
          </div>
          <div className="text-xs text-gray-600">TechNova Inc - $120K</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-900 mb-2">Top Lead Sources</div>
          <div className="space-y-2">
            {[
              { source: "Organic Search", percent: 35 },
              { source: "Email Campaigns", percent: 28 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{item.source}</span>
                  <span className="text-gray-900">{item.percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-[#007AFF] h-1.5 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
