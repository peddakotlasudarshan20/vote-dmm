import { useEffect, useState } from 'react'

function diff(target) {
  const ms = new Date(target) - new Date()
  if (ms <= 0) return null
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return { d, h, m, s }
}

export default function Countdown({ target, label }) {
  const [t, setT] = useState(() => diff(target))

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!t) return null

  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span className="flex gap-1.5">
        {[[t.d, 'd'], [t.h, 'h'], [t.m, 'm'], [t.s, 's']].map(([v, u]) => (
          <span key={u} className="px-1.5 py-0.5 bg-[var(--ink)] text-[var(--paper)] rounded">
            {String(v).padStart(2, '0')}{u}
          </span>
        ))}
      </span>
    </div>
  )
}
