/**
 * Reusable EmptyState component.
 * Replaces duplicate empty-state cards in Dashboard and ApproveUsers.
 */

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet.',
  description,
  children,
}) {
  return (
    <div className="text-center border border-dashed border-[var(--line)] bg-[var(--paper-raised)] rounded-2xl p-12 sm:p-16 shadow-xs">
      <span className="text-3xl mb-3 block">{icon}</span>
      <p className="font-medium text-[var(--ink)] text-sm sm:text-base">
        {title}
      </p>
      {description && (
        <p className="text-xs text-[var(--ink-soft)] mt-1">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
