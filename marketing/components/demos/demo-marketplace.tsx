export function DemoMarketplace() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Lead Marketplace</h3>
        <p className="text-gray-600">Browse and purchase verified lead lists</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "SaaS Founders - Series A", leads: "500", price: "$250", verified: "99%" },
          { title: "VP Marketing - Tech", leads: "1,000", price: "$450", verified: "98%" },
        ].map((list, i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-900 mb-3">{list.title}</div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total Leads</span>
                <span className="text-gray-900">{list.leads}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Verified</span>
                <span className="text-[#007AFF]">{list.verified}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xl text-gray-900">{list.price}</div>
              <button className="px-4 py-2 bg-[#007AFF] text-white rounded text-sm">
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="text-sm text-gray-900 mb-3">What's Included</div>
        <div className="space-y-2">
          {["Full name and title", "Verified email address", "Company details", "LinkedIn profile"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
