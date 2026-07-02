import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireApproved = true }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (requireApproved && profile?.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />
  }
  return children
}

export function AdminRoute({ children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--gold)] rounded-full animate-spin" />
    </div>
  )
}
