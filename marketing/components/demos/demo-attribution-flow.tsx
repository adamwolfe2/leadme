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
    <div className="space-y-2">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-2 border border-gray-200 text-center"
        >
          <div className="text-lg text-gray-900 font-light">{totalVisitors}</div>
          <div className="text-[10px] text-gray-600">Touchpoints</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-2 border border-gray-200 text-center"
        >
          <div className="text-lg text-green-600 font-light">{totalConverted}</div>
          <div className="text-[10px] text-gray-600">Conversions</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-2 border border-gray-200 text-center"
        >
          <div className="text-lg text-[#007AFF] font-light">{conversionRate}%</div>
          <div className="text-[10px] text-gray-600">Rate</div>
        </motion.div>
      </div>

      {/* Compact Flow Visualization */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 relative overflow-hidden"
      >
        <div className="flex flex-col items-center gap-3">
          {/* Traffic Sources */}
          <div className="w-full">
            <div className="text-[10px] text-gray-500 mb-2 font-medium text-center">SOURCES</div>
            <div className="flex justify-center items-center gap-1.5">
              {trafficSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setActiveSource(source.id)}
                  onMouseLeave={() => setActiveSource(null)}
                >
                  <div
                    className="bg-white rounded-md p-1.5 border border-gray-200 cursor-pointer w-[72px]"
                    style={{ borderTopWidth: "3px", borderTopColor: source.color }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <svg className="w-3.5 h-3.5" style={{ color: source.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={source.icon} />
                      </svg>
                      <span className="text-[8px] font-medium text-gray-700 text-center leading-tight">{source.name}</span>
                      <div className="text-[10px] font-semibold" style={{ color: source.color }}>{source.visitors}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Compact Funnel */}
          <div className="flex-shrink-0">
            <div className="w-32 h-24 relative">
              <svg viewBox="0 0 200 150" className="w-full h-full">
                <defs>
                  <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <path d="M 20 5 L 180 5 L 140 70 L 60 70 Z" fill="url(#funnelGradient)" stroke="#007AFF" strokeWidth="2" />
                <path d="M 60 70 L 140 70 L 115 140 L 85 140 Z" fill="url(#funnelGradient)" stroke="#10B981" strokeWidth="2" />
              </svg>
              <div className="absolute top-1 left-0 right-0 text-center">
                <div className="text-xs font-light text-gray-900">{totalVisitors} <span className="text-[8px] text-gray-500">leads</span></div>
              </div>
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <div className="text-xs font-light text-green-600">{totalConverted} <span className="text-[8px] text-gray-500">converted</span></div>
              </div>
            </div>
          </div>

          {/* Outcomes */}
          <div className="w-full">
            <div className="text-[10px] text-gray-500 mb-2 font-medium text-center">OUTCOMES</div>
            <div className="flex justify-center items-center gap-1.5">
              {outcomes.map((outcome, index) => (
                <motion.div
                  key={outcome.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <div
                    className="bg-white rounded-md p-1.5 border border-gray-200 cursor-pointer w-[80px]"
                    style={{ borderBottomWidth: "3px", borderBottomColor: outcome.color }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="text-sm font-light" style={{ color: outcome.color }}>{outcome.value}</div>
                      <span className="text-[8px] font-medium text-gray-700 text-center leading-tight">{outcome.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Particles */}
        <AnimatePresence>
          {particles.map(particle => {
            const sourceIndex = getSourceIndex(particle.sourceId)
            const outcomeIndex = getOutcomeIndex(particle.outcomeId)
            const sourceXPercent = 10 + (sourceIndex * 20)
            const outcomeXPercent = 15 + (outcomeIndex * 23)

            return (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0, scale: 0, x: `${sourceXPercent}%`, y: '10%' }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0, 1, 1, 1, 0],
                  x: [`${sourceXPercent}%`, '50%', `${outcomeXPercent}%`],
                  y: ['10%', '45%', '85%']
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 2, times: [0, 0.15, 0.5, 0.85, 1], ease: "easeInOut" }}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{ backgroundColor: particle.color, boxShadow: `0 0 6px ${particle.color}` }}
              />
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
