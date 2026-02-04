"use client"

import { motion } from "framer-motion"

export function DemoPipelineDashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Pipeline Dashboard</h3>
        <p className="text-gray-600">Live email metrics and outbound performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Emails Sent", value: "2,847", subtitle: "Last 30 days" },
          { label: "Pipeline Value", value: "$2.4M", subtitle: "↑ 18%", isGreen: true },
          { label: "Open Rate", value: "67%", subtitle: "↑ +4.1%", isGreen: true },
          { label: "Active Responses", value: "341", subtitle: "12% reply rate" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
          >
            <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
            <div className="text-2xl text-[#007AFF]">{stat.value}</div>
            <div className={`text-xs mt-1 ${stat.isGreen ? 'text-green-600' : 'text-gray-600'}`}>{stat.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-lg p-4 border border-gray-200"
      >
        <div className="text-sm text-gray-900 mb-4">Top Lead Sources</div>
        <div className="space-y-3">
          {[
            { source: "Website", percent: 35, color: "#007AFF" },
            { source: "Pixel Tracking", percent: 28, color: "#0066DD" },
            { source: "Organic Search", percent: 18, color: "#66B3FF" },
            { source: "Email Campaigns", percent: 12, color: "#99CCFF" },
            { source: "Paid Ads", percent: 7, color: "#CCE5FF" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-700">{item.source}</span>
                <span className="text-gray-900 font-medium">{item.percent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
