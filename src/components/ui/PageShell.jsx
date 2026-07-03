/**
 * Standardized page wrapper with fade-in page transition.
 */

import { Link } from 'react-router-dom'

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  full: 'max-w-6xl',
}

export default function PageShell({
  maxWidth = 'xl',
  backTo,
  backLabel = 'Back',
  center = false,
  className = '',
  children,
}) {
  return (
    <div
      className={`animate-page-enter ${MAX_WIDTHS[maxWidth] || MAX_WIDTHS.xl} mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-12 ${center ? 'text-center' : ''} ${className}`}
    >
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors duration-200 mb-6 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
          {backLabel}
        </Link>
      )}
      {children}
    </div>
  )
}
