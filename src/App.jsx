import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute, { AdminRoute, FullPageSpinner } from './components/ProtectedRoute'

/* ── Eager-loaded: always needed ────────────────────── */
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

/* ── Lazy-loaded: only when navigated to ────────────── */
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'))
const PendingApproval = lazy(() => import('./pages/PendingApproval'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ElectionDetails = lazy(() => import('./pages/ElectionDetails'))
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'))
const VoteConfirm = lazy(() => import('./pages/VoteConfirm'))
const VoteSuccess = lazy(() => import('./pages/VoteSuccess'))
const Results = lazy(() => import('./pages/Results'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ApproveUsers = lazy(() => import('./pages/admin/ApproveUsers'))
const ManageElections = lazy(() => import('./pages/admin/ManageElections'))
const ManageCandidates = lazy(() => import('./pages/admin/ManageCandidates'))

function App() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={
              <ProtectedRoute requireApproved={false}><PendingApproval /></ProtectedRoute>
            } />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetails /></ProtectedRoute>} />
            <Route path="/candidates/:id" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
            <Route path="/vote/:electionId/:candidateId" element={<ProtectedRoute><VoteConfirm /></ProtectedRoute>} />
            <Route path="/vote-success" element={<ProtectedRoute><VoteSuccess /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/approvals" element={<AdminRoute><ApproveUsers /></AdminRoute>} />
            <Route path="/admin/elections" element={<AdminRoute><ManageElections /></AdminRoute>} />
            <Route path="/admin/candidates" element={<AdminRoute><ManageCandidates /></AdminRoute>} />

            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}

export default App
