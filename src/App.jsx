import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/ui/Footer'
import ProtectedRoute, { AdminRoute, FullPageSpinner } from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'

/* ── Eager-loaded: critical path ────────────────────── */
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

/* ── Lazy-loaded: on demand ─────────────────────────── */
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'))
const PendingApproval = lazy(() => import('./pages/PendingApproval'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ElectionDetails = lazy(() => import('./pages/ElectionDetails'))
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'))
const VoteConfirm = lazy(() => import('./pages/VoteConfirm'))
const VoteSuccess = lazy(() => import('./pages/VoteSuccess'))
const Results = lazy(() => import('./pages/Results'))
const Profile = lazy(() => import('./pages/Profile'))
const Notifications = lazy(() => import('./pages/Notifications'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ApproveUsers = lazy(() => import('./pages/admin/ApproveUsers'))
const ManageElections = lazy(() => import('./pages/admin/ManageElections'))
const ManageCandidates = lazy(() => import('./pages/admin/ManageCandidates'))
const ManageNotifications = lazy(() => import('./pages/admin/ManageNotifications'))

function App() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/pending-approval" element={
              <ProtectedRoute requireApproved={false}><PendingApproval /></ProtectedRoute>
            } />

            {/* Student */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetails /></ProtectedRoute>} />
            <Route path="/candidates/:id" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
            <Route path="/vote/:electionId/:candidateId" element={<ProtectedRoute><VoteConfirm /></ProtectedRoute>} />
            <Route path="/vote-success" element={<ProtectedRoute><VoteSuccess /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Admin — nested under AdminLayout */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/approvals" element={<ApproveUsers />} />
              <Route path="/admin/elections" element={<ManageElections />} />
              <Route path="/admin/candidates" element={<ManageCandidates />} />
              <Route path="/admin/notifications" element={<ManageNotifications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {/* Footer: shown on all pages except admin panel */}
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
