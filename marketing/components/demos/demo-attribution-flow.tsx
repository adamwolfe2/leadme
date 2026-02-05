"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"

interface TrafficSource {
  id: string
  name: string
  icon: string
  visitors: number
  color: string
}

interface Outcome {
  id: string
  label: string
  value: number
  color: string
}

interface Particle {
  id: string
  sourceId: string
  outcomeId: string
  color: string
  sourceX: number
  sourceY: number
  funnelX: number
  funnelY: number
  outcomeX: number
  outcomeY: number
}

const trafficSources: TrafficSource[] = [
  { id: "website", name: "Website Visit", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", visitors: 1000, color: "#007AFF" },
  { id: "email", name: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", visitors: 350, color: "#10B981" },
  { id: "directmail", name: "Direct Mail", icon: "M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76", visitors: 250, color: "#8B5CF6" },
  { id: "ads", name: "Retargeting Ads", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122", visitors: 150, color: "#F59E0B" },
  { id: "phone", name: "Phone Call", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", visitors: 209, color: "#EF4444" },
]

const outcomes: Outcome[] = [
  { id: "demo", label: "Demo Booked", value: 145, color: "#10B981" },
  { id: "trial", label: "Trial Started", value: 98, color: "#8B5CF6" },
  { id: "purchase", label: "Purchased", value: 67, color: "#F59E0B" },
  { id: "enterprise", label: "Enterprise Deal", value: 22, color: "#EF4444" },
]

export function DemoAttributionFlow() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate multiple particles continuously
  useEffect(() => {
    const createParticle = () => {
      const source = trafficSources[Math.floor(Math.random() * trafficSources.length)]
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]

      const particle: Particle = {
        id: `particle-${Date.now()}-${Math.random()}`,
        sourceId: source.id,
        outcomeId: outcome.id,
        color: source.color,
        sourceX: 0,
        sourceY: 0,
        funnelX: 0,
        funnelY: 0,
        outcomeX: 0,
        outcomeY: 0,
      }

      setParticles(prev => [...prev, particle])

      // Remove particle after animation completes
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id))
      }, 3000)
    }

    // Create particles at varying intervals for continuous flow
    const intervals = [400, 600, 500, 700, 450]
    const intervalIds = intervals.map((delay, index) =>
      setInterval(createParticle, delay + (index * 100))
    )

    return () => {
      intervalIds.forEach(id => clearInterval(id))
    }
  }, [])

  const totalVisitors = trafficSources.reduce((sum, c) => sum + c.visitors, 0)
  const totalConverted = outcomes.reduce((sum, c) => sum + c.value, 0)
  const conversionRate = Math.round((totalConverted / totalVisitors) * 100)

  // Calculate positions for particles
  const getSourceIndex = (sourceId: string) => trafficSources.findIndex(s => s.id === sourceId)
  const getOutcomeIndex = (outcomeId: string) => outcomes.findIndex(o => o.id === outcomeId)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl text-gray-900 mb-2">Multi-Channel Attribution</h3>
        <p className="text-gray-600">Visualize traffic flowing from sources through conversion to outcomes</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200 text-center"
        >
          <div className="text-2xl text-gray-900 font-light mb-1">{totalVisitors}</div>
          <div className="text-xs text-gray-600">Total Touchpoints</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-gray-200 text-center"
        >
          <div className="text-2xl text-green-600 font-light mb-1">{totalConverted}</div>
          <div className="text-xs text-gray-600">Conversions</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-gray-200 text-center"
        >
          <div className="text-2xl text-[#007AFF] font-light mb-1">{conversionRate}%</div>
          <div className="text-xs text-gray-600">Conversion Rate</div>
        </motion.div>
      </div>

      {/* Vertical Flow Visualization */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 relative overflow-hidden"
        style={{ minHeight: "700px" }}
      >
        <div className="flex flex-col items-center h-full gap-8">
          {/* Traffic Sources - TOP ROW */}
          <div className="w-full">
            <div className="text-xs text-gray-600 mb-4 font-medium text-center">TRAFFIC SOURCES</div>
            <div className="flex justify-center items-center gap-4">
              {trafficSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setActiveSource(source.id)}
                  onMouseLeave={() => setActiveSource(null)}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: -5 }}
                    className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer w-32"
                    style={{
                      borderTopWidth: "4px",
                      borderTopColor: source.color,
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6" style={{ color: source.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={source.icon} />
                      </svg>
                      <span className="text-xs font-medium text-gray-900 text-center">{source.name}</span>
                      <div className="text-sm font-semibold" style={{ color: source.color }}>
                        {source.visitors}
                      </div>
                    </div>
                  </motion.div>

                  {/* Pulse effect when active */}
                  {activeSource === source.id && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{ border: `2px solid ${source.color}` }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* FUNNEL - MIDDLE SECTION */}
          <div className="flex-shrink-0 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="w-64 h-80 relative">
                {/* Vertical Funnel shape */}
                <svg viewBox="0 0 200 300" className="w-full h-full">
                  <defs>
                    <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Wide top (leads entrance) */}
                  <path
                    d="M 20 10 L 180 10 L 160 100 L 40 100 Z"
                    fill="url(#funnelGradient)"
                    stroke="#007AFF"
                    strokeWidth="2"
                    filter="url(#glow)"
                  />
                  {/* Middle section */}
                  <path
                    d="M 40 100 L 160 100 L 140 180 L 60 180 Z"
                    fill="url(#funnelGradient)"
                    stroke="#10B981"
                    strokeWidth="2"
                    filter="url(#glow)"
                  />
                  {/* Narrow bottom (conversions) */}
                  <path
                    d="M 60 180 L 140 180 L 120 270 L 80 270 Z"
                    fill="url(#funnelGradient)"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    filter="url(#glow)"
                  />
                </svg>

                {/* Funnel labels */}
                <div className="absolute top-10 left-0 right-0 text-center">
                  <div className="text-2xl font-light text-gray-900">{totalVisitors}</div>
                  <div className="text-xs text-gray-600 font-medium">LEADS</div>
                </div>
                <div className="absolute top-1/2 left-0 right-0 text-center -translate-y-1/2">
                  <div className="text-lg font-light text-[#007AFF]">
                    {Math.round(totalVisitors * 0.6)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">QUALIFIED</div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center">
                  <div className="text-2xl font-light text-green-600">{totalConverted}</div>
                  <div className="text-xs text-gray-600 font-medium">CUSTOMERS</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Outcomes - BOTTOM ROW */}
          <div className="w-full">
            <div className="text-xs text-gray-600 mb-4 font-medium text-center">OUTCOMES</div>
            <div className="flex justify-center items-center gap-4">
              {outcomes.map((outcome, index) => (
                <motion.div
                  key={outcome.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: 5 }}
                    className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:shadow-lg transition-all cursor-pointer w-32"
                    style={{
                      borderBottomWidth: "4px",
                      borderBottomColor: outcome.color,
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-2xl font-light" style={{ color: outcome.color }}>
                        {outcome.value}
                      </div>
                      <span className="text-xs font-medium text-gray-900 text-center">{outcome.label}</span>
                      <div className="text-xs text-gray-600">
                        {Math.round((outcome.value / totalVisitors) * 100)}% rate
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Particles - Multiple flowing simultaneously */}
        <AnimatePresence>
          {particles.map(particle => {
            const sourceIndex = getSourceIndex(particle.sourceId)
            const outcomeIndex = getOutcomeIndex(particle.outcomeId)

            // Calculate positions based on index
            const sourceXPercent = 20 + (sourceIndex * 15) // Spread across top
            const outcomeXPercent = 20 + (outcomeIndex * 15) // Spread across bottom

            return (
              <motion.div
                key={particle.id}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: `${sourceXPercent}%`,
                  y: '8%'
                }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0, 1, 1, 1, 0],
                  x: [`${sourceXPercent}%`, '50%', `${outcomeXPercent}%`],
                  y: ['8%', '42%', '85%']
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 2.5,
                  times: [0, 0.15, 0.5, 0.85, 1],
                  ease: "easeInOut"
                }}
                className="absolute w-3 h-3 rounded-full pointer-events-none"
                style={{
                  backgroundColor: particle.color,
                  boxShadow: `0 0 10px ${particle.color}`,
                  filter: 'blur(0.5px)'
                }}
              />
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Best Performing Path */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-300"
      >
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Best Performing Path</span>
        </div>
        <div className="text-xs text-gray-600">
          Website Visit → Email Campaign → Demo Booked (34% conversion rate)
        </div>
      </motion.div>
    </div>
  )
}
