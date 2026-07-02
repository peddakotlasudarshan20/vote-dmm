/**
 * Skeleton loader component for loading states.
 * Replaces FullPageSpinner in data-heavy pages for a more polished UX.
 */

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return <div className={`skeleton ${width} ${height} ${className}`} />
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 ${className}`}>
      <SkeletonLine width="w-2/3" height="h-5" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? 'w-full' : 'w-4/5'} />
      ))}
    </div>
  )
}

export function SkeletonStatGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <SkeletonLine width="w-20" height="h-3" />
            <div className="skeleton w-10 h-10 rounded-xl" />
          </div>
          <SkeletonLine width="w-16" height="h-8" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl shadow-xs divide-y divide-[var(--line)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 sm:p-5 flex items-center gap-4">
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-1/3" height="h-4" />
            <SkeletonLine width="w-2/3" height="h-3" />
          </div>
          <SkeletonLine width="w-20" height="h-8" className="shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
