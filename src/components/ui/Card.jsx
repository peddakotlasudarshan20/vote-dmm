/**
 * Reusable Card component.
 * Standardizes border-radius (rounded-2xl), padding, border, and shadow.
 */

export default function Card({
  hoverable = false,
  className = '',
  padding = 'p-5 sm:p-6',
  children,
  style,
  ...props
}) {
  return (
    <div
      className={`bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl shadow-xs ${padding} ${hoverable ? 'card-hover' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}
