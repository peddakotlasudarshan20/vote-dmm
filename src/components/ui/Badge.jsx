/**
 * General-purpose Badge component.
 * Replaces StatusBadge with a more flexible API.
 */
import { memo } from 'react'

const VARIANTS = {
  success: 'bg-[var(--ballot-green-soft)] text-[var(--ballot-green)]',
  warning: 'bg-[var(--gold-soft)] text-[var(--gold)]',
  error: 'bg-[var(--ballot-red-soft)] text-[var(--ballot-red)]',
  info: 'bg-blue-50 text-blue-600',
  neutral: 'bg-[var(--line)] text-[var(--ink-soft)]',
}

/* Map election/user statuses to badge variants */
const STATUS_MAP = {
  upcoming: { variant: 'warning', label: 'Upcoming' },
  active: { variant: 'success', label: 'Active', pulse: true },
  completed: { variant: 'neutral', label: 'Completed' },
  pending_approval: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'error', label: 'Rejected' },
}

const Badge = memo(function Badge({
  variant = 'neutral',
  status,
  label,
  pulse = false,
  className = '',
}) {
  const mapped = status ? STATUS_MAP[status] : null
  const v = mapped?.variant || variant
  const text = label || mapped?.label || status || ''
  const showPulse = pulse || mapped?.pulse

  return (
    <span
      role="status"
      aria-label={`Status: ${text}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${VARIANTS[v] || VARIANTS.neutral} ${className}`}
    >
      {showPulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${v === 'success' ? 'bg-[var(--ballot-green)]' : 'bg-current'}`}
          aria-hidden="true"
        />
      )}
      {text}
    </span>
  )
})

export default Badge
