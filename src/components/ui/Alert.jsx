/**
 * Reusable Alert component with slide-in animation.
 * Variants: error, success, info, warning
 */

const VARIANTS = {
  error:
    'text-[var(--ballot-red)] bg-[var(--ballot-red-soft)] border-[var(--ballot-red)]/10',
  success:
    'text-[var(--ballot-green)] bg-[var(--ballot-green-soft)] border-[var(--ballot-green)]/10',
  info:
    'text-[var(--gold)] bg-[var(--gold-soft)] border-[var(--gold)]/10',
  warning:
    'text-[var(--gold)] bg-[var(--gold-soft)] border-[var(--gold)]/20',
}

const ICONS = {
  error: '⚠️',
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
}

export default function Alert({ variant = 'error', children, className = '' }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 text-xs font-medium px-4 py-3 rounded-xl border animate-alert-enter ${VARIANTS[variant] || VARIANTS.error} ${className}`}
    >
      <span className="shrink-0 text-sm leading-none mt-px">{ICONS[variant]}</span>
      <span>{children}</span>
    </div>
  )
}
