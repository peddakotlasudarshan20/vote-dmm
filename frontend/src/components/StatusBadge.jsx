const STYLES = {
  upcoming: 'bg-[var(--gold-soft)] text-[var(--gold)]',
  active: 'bg-[var(--ballot-green-soft)] text-[var(--ballot-green)]',
  completed: 'bg-[var(--line)] text-[var(--ink-soft)]',
  pending_approval: 'bg-[var(--gold-soft)] text-[var(--gold)]',
  approved: 'bg-[var(--ballot-green-soft)] text-[var(--ballot-green)]',
  rejected: 'bg-[var(--ballot-red-soft)] text-[var(--ballot-red)]',
}

const LABELS = {
  upcoming: 'Upcoming',
  active: 'Active now',
  completed: 'Completed',
  pending_approval: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || STYLES.completed}`}>
      {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--ballot-green)] animate-pulse" />}
      {LABELS[status] || status}
    </span>
  )
}
