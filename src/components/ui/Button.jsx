/**
 * Reusable Button component.
 * Variants: primary, secondary, danger, success, ghost, gold
 * Sizes: sm, md, lg
 * Features: loading spinner, hover lift, press feedback
 */

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shrink-0'

const VARIANTS = {
  primary:
    'bg-[var(--ink)] text-[var(--paper-raised)] hover:bg-[var(--gold)] hover:-translate-y-0.5 active:translate-y-0 shadow-xs',
  secondary:
    'border border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--paper)] active:scale-[0.98]',
  danger:
    'border border-[var(--ballot-red)] text-[var(--ballot-red)] hover:bg-[var(--ballot-red-soft)] active:scale-[0.98]',
  success:
    'bg-[var(--ballot-green)] text-white hover:opacity-90 active:scale-[0.98] shadow-xs',
  ghost:
    'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)]',
  gold:
    'bg-[var(--gold)] text-white hover:opacity-90 shadow-xs',
}

const SIZES = {
  sm: 'text-xs px-3.5 py-2 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-sm px-6 py-3 rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  )
}
