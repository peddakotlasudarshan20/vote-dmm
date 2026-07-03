/**
 * Centralized Date/Time utilities for CloudVote.
 * All display times use Asia/Kolkata (IST) timezone.
 * Storage uses UTC (Supabase default).
 */

const TZ = 'Asia/Kolkata'

/**
 * Format date only: "02 Jul 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(dateStr))
}

/**
 * Format date + time: "02 Jul 2026, 10:30 AM"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TZ,
  }).format(new Date(dateStr))
}

/**
 * Format time only: "10:30 AM"
 */
export function formatTime(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TZ,
  }).format(new Date(dateStr))
}

/**
 * Full display: "Thursday, 02 July 2026"
 */
export function formatDateFull(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(dateStr))
}

/**
 * Convert a UTC date to IST Date object for countdown calculations.
 */
export function toIST(dateStr) {
  // Create a formatter that outputs IST parts
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(dateStr))

  const get = (type) => parts.find((p) => p.type === type)?.value || '0'
  return new Date(
    `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`
  )
}

/**
 * Format a date range: "02 Jul 2026 – 07 Jul 2026"
 */
export function formatDateRange(startStr, endStr) {
  return `${formatDate(startStr)} – ${formatDate(endStr)}`
}

/**
 * Relative time: "2 hours ago", "in 3 days"
 */
export function formatRelative(dateStr) {
  if (!dateStr) return '—'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const absDiff = Math.abs(diffMs)
  const isPast = diffMs > 0

  if (absDiff < 60000) return 'Just now'
  if (absDiff < 3600000) {
    const mins = Math.floor(absDiff / 60000)
    return isPast ? `${mins}m ago` : `in ${mins}m`
  }
  if (absDiff < 86400000) {
    const hours = Math.floor(absDiff / 3600000)
    return isPast ? `${hours}h ago` : `in ${hours}h`
  }
  if (absDiff < 604800000) {
    const days = Math.floor(absDiff / 86400000)
    return isPast ? `${days}d ago` : `in ${days}d`
  }
  return formatDate(dateStr)
}
