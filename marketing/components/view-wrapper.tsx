"use client"

import { useView } from '@/lib/view-context'

interface ViewWrapperProps {
  children: React.ReactNode
}

export function HumanView({ children }: ViewWrapperProps) {
  const { view } = useView()
  return view === 'human' ? <>{children}</> : null
}

export function MachineView({ children }: ViewWrapperProps) {
  const { view } = useView()
  return view === 'machine' ? (
    <div className="machine-view bg-black text-gray-300 font-mono text-sm leading-relaxed">
      {children}
    </div>
  ) : null
}

interface MachineContentProps {
  children: React.ReactNode
  className?: string
}

export function MachineContent({ children, className = '' }: MachineContentProps) {
  return (
    <div className={`max-w-4xl mx-auto px-6 py-12 ${className}`}>
      {children}
    </div>
  )
}

interface MachineSectionProps {
  title: string
  children: React.ReactNode
}

export function MachineSection({ title, children }: MachineSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl text-white mb-6 font-bold">## {title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

interface MachineLinkProps {
  href: string
  children: React.ReactNode
}

export function MachineLink({ href, children }: MachineLinkProps) {
  return (
    <a href={href} className="text-gray-300 hover:text-white transition-colors">
      [{children}]({href})
    </a>
  )
}

interface MachineListProps {
  items: string[] | { label: string; href?: string; description?: string }[]
}

export function MachineList({ items }: MachineListProps) {
  return (
    <ul className="space-y-2 ml-4">
      {items.map((item, i) => {
        if (typeof item === 'string') {
          return (
            <li key={i} className="before:content-['•'] before:mr-2 before:text-gray-500">
              {item}
            </li>
          )
        }
        return (
          <li key={i} className="before:content-['•'] before:mr-2 before:text-gray-500">
            {item.href ? (
              <>
                <MachineLink href={item.href}>{item.label}</MachineLink>
                {item.description && (
                  <span className="text-gray-500 block ml-4 mt-1">{item.description}</span>
                )}
              </>
            ) : (
              <>
                {item.label}
                {item.description && (
                  <span className="text-gray-500 block ml-4 mt-1">{item.description}</span>
                )}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
