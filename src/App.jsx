import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import PendingApproval from './pages/PendingApproval'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ElectionDetails from './pages/ElectionDetails'
import CandidateProfile from './pages/CandidateProfile'
import VoteConfirm from './pages/VoteConfirm'
import VoteSuccess from './pages/VoteSuccess'
import Results from './pages/Results'
import Profile from './pages/Profile'

import AdminDashboard from './pages/admin/AdminDashboard'
import ApproveUsers from './pages/admin/ApproveUsers'
import ManageElections from './pages/admin/ManageElections'
import ManageCandidates from './pages/admin/ManageCandidates'

function App() {
  return (
    <>
      <Navbar />
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
    </>
  )
}

export default App
