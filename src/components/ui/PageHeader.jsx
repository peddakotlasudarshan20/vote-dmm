/**
 * Standardized page header with title, subtitle, and optional right slot.
 * Replaces duplicated header patterns across Dashboard, ApproveUsers,
 * ManageElections, ManageCandidates, and AdminDashboard.
 */

export default function PageHeader({
  title,
  subtitle,
  children,
  border = true,
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 ${border ? 'border-b border-[var(--line)] pb-4' : ''}`}
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}
