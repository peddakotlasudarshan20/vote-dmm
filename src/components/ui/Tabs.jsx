/**
 * Reusable Tabs component.
 * Replaces inline filter button groups across Dashboard and ApproveUsers.
 */
import { memo } from 'react'

const Tabs = memo(function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex bg-[var(--line)]/40 p-1 rounded-xl overflow-x-auto ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            active === tab.value
              ? 'bg-white shadow-xs text-[var(--ink)]'
              : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          {tab.label}
          {tab.count != null && (
            <span className={`ml-1.5 tabular-nums ${active === tab.value ? 'text-[var(--ink-soft)]' : ''}`}>
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
})

export default Tabs
