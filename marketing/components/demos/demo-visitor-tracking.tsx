"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface Visitor {
  id: string
  name: string
  email: string
  phone: string
  location: string
  page: string
  enrichmentStep: number
}

const visitorPool = [
  { name: "Sarah Johnson", email: "sarah.j@acmecorp.com", phone: "(555) 234-5678", location: "San Francisco, CA", page: "/pricing" },
  { name: "Mike Chen", email: "m.chen@techstart.io", phone: "(555) 789-0123", location: "New York, NY", page: "/features" },
  { name: "Emily Rodriguez", email: "emily@saasco.com", phone: "(555) 456-7890", location: "Austin, TX", page: "/demo" },
  { name: "David Park", email: "d.park@innovate.co", phone: "(555) 321-9876", location: "Seattle, WA", page: "/platform" },
  { name: "Jessica Martinez", email: "jess@growth.io", phone: "(555) 654-3210", location: "Miami, FL", page: "/contact" },
  { name: "Tom Anderson", email: "tom.a@scale.ai", phone: "(555) 987-6543", location: "Boston, MA", page: "/about" },
]

export function DemoVisitorTracking() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [totalToday, setTotalToday] = useState(124)
  const [liveCount, setLiveCount] = useState(3)

  // Add new visitors periodically
  useEffect(() => {
    // Start with 3 visitors
    const initialVisitors = visitorPool.slice(0, 3).map((v, i) => ({
      ...v,
      id: `initial-${i}`,
      enrichmentStep: 4, // Fully enriched
    }))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisitors(initialVisitors)

    const interval = setInterval(() => {
      const randomVisitor = visitorPool[Math.floor(Math.random() * visitorPool.length)]
      const newVisitor: Visitor = {
        ...randomVisitor,
        id: `visitor-${Math.random()}`,
        enrichmentStep: 0,
      }

      setVisitors(prev => {
        const updated = [newVisitor, ...prev].slice(0, 3) // Keep max 3 visitors
        return updated
      })

      setTotalToday(prev => prev + 1)
      setLiveCount(prev => Math.min(prev + 1, 8))
    }, 4000) // New visitor every 4 seconds

    return () => clearInterval(interval)
  }, [])

  // Animate enrichment for new visitors
  useEffect(() => {
    const enrichmentInterval = setInterval(() => {
      setVisitors(prev =>
        prev.map(visitor =>
          visitor.enrichmentStep < 4
            ? { ...visitor, enrichmentStep: visitor.enrichmentStep + 1 }
            : visitor
        )
      )
    }, 500) // Enrich one field every 500ms

    return () => clearInterval(enrichmentInterval)
  }, [])

  // Animate stat counters
  useEffect(() => {
    const statInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveCount(prev => Math.max(3, Math.min(10, prev + (Math.random() > 0.5 ? 1 : -1))))
      }
    }, 3000)

    return () => clearInterval(statInterval)
  }, [])

  return (
    <div className="space-y-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-2.5 border border-gray-200"
        >
          <motion.div
            key={totalToday}
            initial={{ scale: 1.2, color: "#007AFF" }}
            animate={{ scale: 1, color: "#111827" }}
            transition={{ duration: 0.3 }}
            className="text-xl text-gray-900 font-light"
          >
            {totalToday}
          </motion.div>
          <div className="text-xs text-gray-600">Identified Today</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg p-2.5 border border-gray-200"
        >
          <motion.div
            key={liveCount}
            initial={{ scale: 1.2, color: "#10B981" }}
            animate={{ scale: 1, color: "#111827" }}
            transition={{ duration: 0.3 }}
            className="text-xl text-gray-900 font-light"
          >
            {liveCount}
          </motion.div>
          <div className="text-xs text-gray-600">Live Now</div>
        </motion.div>
      </div>

      {/* Live Visitors Stream */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
          />
          <h4 className="text-xs text-gray-900 font-medium">Live Visitors</h4>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {visitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, x: -100, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                layout
                className="bg-white rounded-md p-2 border border-gray-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: visitor.enrichmentStep >= 1 ? 1 : 0.3 }}
                        className="text-xs text-gray-900 font-medium truncate"
                      >
                        {visitor.enrichmentStep >= 1 ? visitor.name : "Identifying..."}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: visitor.enrichmentStep >= 2 ? 1 : 0.3 }}
                        className="text-[10px] text-[#007AFF] truncate"
                      >
                        {visitor.enrichmentStep >= 2 ? visitor.page : ""}
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: visitor.enrichmentStep >= 3 ? 1 : 0.3 }}
                        className="text-[10px] text-gray-500 truncate"
                      >
                        {visitor.enrichmentStep >= 3 ? visitor.email : "Enriching..."}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: visitor.enrichmentStep >= 4 ? 1 : 0.3 }}
                        className="text-[10px] text-gray-500 truncate"
                      >
                        {visitor.enrichmentStep >= 4 ? visitor.phone : ""}
                      </motion.span>
                    </div>
                  </div>
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-full flex items-center gap-1 flex-shrink-0"
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1 h-1 bg-blue-500 rounded-full"
                    />
                    Live
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
