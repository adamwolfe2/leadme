"use client"

import { motion } from "framer-motion"

export function DemoLeadSequence() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Automated Lead Sequences</h3>
        <p className="text-gray-600">Multi-touch campaigns that convert on autopilot</p>
      </div>

      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
        {[
          { day: "Day 1", action: "Pixel Tracking", status: "Complete", color: "from-blue-50 to-blue-100" },
          { day: "Day 2", action: "Leads Enriched", status: "Complete", color: "from-blue-50 to-blue-100" },
          { day: "Day 3", action: "Email Campaign", status: "Active", color: "from-blue-100 to-blue-200" },
          { day: "Day 4", action: "Leads Generated", status: "Pending", color: "from-gray-50 to-gray-100" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${step.color} border-2 ${
              step.status === "Active" ? "border-[#007AFF]" : "border-transparent"
            } rounded-lg p-4 min-w-[140px] text-center shadow-sm`}>
              <div className="text-xs text-gray-600 mb-1">{step.day}</div>
              <div className="text-sm text-gray-900 font-medium mb-1">{step.action}</div>
              <div className={`text-xs px-2 py-1 rounded ${
                step.status === "Complete" ? "bg-green-100 text-green-700" :
                step.status === "Active" ? "bg-blue-100 text-[#007AFF]" :
                "bg-gray-200 text-gray-600"
              }`}>
                {step.status}
              </div>
            </div>
            {i < 3 && (
              <svg className="w-5 h-5 text-[#007AFF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
      >
        <div className="text-sm text-gray-900 mb-4">Average Sequence Performance</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: "80%", label: "Open Rate", delay: 0.8 },
            { value: "42%", label: "Reply Rate", delay: 0.9 },
            { value: "8%", label: "Booked", delay: 1.0 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-2xl text-[#007AFF] mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
