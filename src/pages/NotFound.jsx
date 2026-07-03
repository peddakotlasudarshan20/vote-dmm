import { Link } from 'react-router-dom'
import PageShell from '../components/ui/PageShell'
import EmptyState from '../components/ui/EmptyState'

export default function NotFound() {
  return (
    <PageShell maxWidth="md" center>
      <EmptyState
        icon="🔍"
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--gold)] font-medium hover:underline"
        >
          ← Go back home
        </Link>
      </EmptyState>
    </PageShell>
  )
}
