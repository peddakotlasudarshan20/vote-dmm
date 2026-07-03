import { supabase } from './supabaseClient'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) Object.assign(headers, await authHeaders())

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

// ---------------------------------------------------- Mock API Implementation
const getDB = () => {
  const raw = localStorage.getItem('cloudvote_mock_db')
  if (!raw) return {}
  const db = JSON.parse(raw)
  
  // Ensure elections exist in mock db
  if (!db.elections) {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString()
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString()
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString()
    
    db.elections = [
      {
        id: 'election-1',
        name: 'Student Council General Election 2026',
        description: 'Vote for your next President and General Secretary of the Student Council. Every approved student is eligible to cast exactly one vote.',
        banner_url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600',
        start_time: oneDayAgo,
        end_time: fiveDaysFromNow,
        results_published: false,
        created_at: oneDayAgo
      },
      {
        id: 'election-2',
        name: 'Sports Club Presidency 2026',
        description: 'Selection for the captain and president of the official university sports club. Active campaign is open until the start date.',
        banner_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
        start_time: twoDaysFromNow,
        end_time: fiveDaysFromNow,
        results_published: false,
        created_at: oneDayAgo
      },
      {
        id: 'election-3',
        name: 'Alumni Association Representative',
        description: 'Annual election for the alumni representative on the university executive board. Voting is closed.',
        banner_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
        start_time: fiveDaysAgo,
        end_time: oneDayAgo,
        results_published: true,
        created_at: fiveDaysAgo
      }
    ]
  }

  // Ensure votes, notifications, audit logs exist
  if (!db.votes) {
    db.votes = [
      // Seed some votes for completed election-3
      { id: 'v-1', election_id: 'election-3', candidate_id: 'candidate-5', voter_id: 'voter-seed-1', reference_id: 'A9B8C7D6E5', created_at: new Date().toISOString() },
      { id: 'v-2', election_id: 'election-3', candidate_id: 'candidate-5', voter_id: 'voter-seed-2', reference_id: 'F1E2D3C4B5', created_at: new Date().toISOString() },
      { id: 'v-3', election_id: 'election-3', candidate_id: 'candidate-6', voter_id: 'voter-seed-3', reference_id: 'J0H8G7F6E5', created_at: new Date().toISOString() },
    ]
  }

  if (!db.notifications) {
    db.notifications = [
      {
        id: 'n-1',
        user_id: null,
        title: 'Alumni Association Representative Results Published',
        message: 'The election results for Alumni Association Representative have been published. View the dashboard to see details.',
        type: 'success',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'n-2',
        user_id: null,
        title: 'Student Council Election Live',
        message: 'The Student Council General Election 2026 is officially open for voting. Cast your vote now!',
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
      }
    ]
  }

  if (!db.audit_log) {
    db.audit_log = []
  }

  localStorage.setItem('cloudvote_mock_db', JSON.stringify(db))
  return db
}

const saveDB = (db) => {
  localStorage.setItem('cloudvote_mock_db', JSON.stringify(db))
}

const getMockCurrentUserProfile = () => {
  const session = JSON.parse(localStorage.getItem('cloudvote_mock_session') || 'null')
  if (!session) return null
  const db = getDB()
  const user = db.users[session.user.id]
  return user ? user.profile : null
}

const getElectionStatus = (e) => {
  const now = new Date()
  const start = new Date(e.start_time)
  const end = new Date(e.end_time)
  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'active'
}

const mockApi = {
  listElections: async () => {
    const db = getDB()
    return db.elections.map((e) => {
      const candidates = db.candidates.filter((c) => c.election_id === e.id)
      return {
        ...e,
        status: getElectionStatus(e),
        candidate_count: candidates.length
      }
    })
  },
  electionDetail: async (id) => {
    const db = getDB()
    const election = db.elections.find((e) => e.id === id)
    if (!election) throw new Error('Election not found')
    const candidates = db.candidates.filter((c) => c.election_id === id)
    return {
      election: { ...election, status: getElectionStatus(election) },
      candidates
    }
  },
  results: async (id) => {
    const db = getDB()
    const election = db.elections.find((e) => e.id === id)
    if (!election) throw new Error('Election not found')
    
    const profile = getMockCurrentUserProfile()
    const isAdmin = profile?.role === 'admin'
    
    if (!election.results_published && !isAdmin) {
      return { published: false }
    }

    const candidates = db.candidates.filter((c) => c.election_id === id)
    const votes = db.votes.filter((v) => v.election_id === id)
    const totalVotes = votes.length

    const counts = {}
    votes.forEach((v) => {
      counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1
    })

    const rankings = candidates.map((c) => {
      const vc = counts[c.id] || 0
      return {
        candidate_id: c.id,
        name: c.name,
        party_name: c.party_name,
        photo_url: c.photo_url,
        votes: vc,
        percentage: totalVotes ? Math.round((vc / totalVotes) * 10000) / 100 : 0
      }
    })

    rankings.sort((a, b) => b.votes - a.votes)

    const approvedUsersCount = Object.values(db.users).filter((u) => u.profile?.status === 'approved').length + 3 // add some mock voters
    const turnout = approvedUsersCount ? Math.round((totalVotes / approvedUsersCount) * 10000) / 100 : 0

    return {
      published: true,
      election_name: election.name,
      total_votes: totalVotes,
      turnout_percentage: turnout,
      winner: rankings[0] || null,
      rankings
    }
  },
  profile: async () => {
    const profile = getMockCurrentUserProfile()
    if (!profile) throw new Error('Not authenticated')
    return profile
  },
  notifications: async () => {
    const profile = getMockCurrentUserProfile()
    if (!profile) throw new Error('Not authenticated')
    const db = getDB()
    return db.notifications.filter((n) => n.user_id === null || n.user_id === profile.id)
  },
  vote: async (election_id, candidate_id) => {
    const profile = getMockCurrentUserProfile()
    if (!profile) throw new Error('Not authenticated')
    if (profile.status !== 'approved') throw new Error('Your account is not approved yet.')

    const db = getDB()
    const election = db.elections.find((e) => e.id === election_id)
    if (!election) throw new Error('Election not found')
    
    const status = getElectionStatus(election)
    if (status === 'upcoming') throw new Error('Election has not started yet.')
    if (status === 'completed') throw new Error('Election has ended.')

    const existing = db.votes.find((v) => v.election_id === election_id && v.voter_id === profile.id)
    if (existing) throw new Error('You have already cast your vote.')

    const candidate = db.candidates.find((c) => c.id === candidate_id && c.election_id === election_id)
    if (!candidate) throw new Error('Invalid candidate for this election.')

    const ref = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase()
    const newVote = {
      id: 'v-' + Math.random().toString(36).substr(2, 9),
      election_id,
      candidate_id,
      voter_id: profile.id,
      reference_id: ref,
      created_at: new Date().toISOString()
    }

    db.votes.push(newVote)
    
    // Log audit
    db.audit_log.push({
      id: 'a-' + Math.random().toString(36).substr(2, 9),
      actor_id: profile.id,
      action: 'vote_cast',
      details: { election_id },
      created_at: new Date().toISOString()
    })

    saveDB(db)
    return {
      success: true,
      reference_id: ref,
      election_name: election.name,
      voted_at: newVote.created_at
    }
  },
  dashboardStats: async () => {
    const db = getDB()
    const usersList = Object.values(db.users)
    return {
      registered_users: usersList.length,
      pending_approvals: usersList.filter((u) => u.profile?.status === 'pending_approval').length,
      approved_users: usersList.filter((u) => u.profile?.status === 'approved').length,
      elections: db.elections.length,
      candidates: db.candidates.length,
      votes_cast: db.votes.length
    }
  },
  adminListUsers: async (status) => {
    const db = getDB()
    const list = Object.values(db.users).map((u) => u.profile)
    if (status) return list.filter((p) => p.status === status)
    return list
  },
  approveUser: async (id) => {
    const db = getDB()
    const user = db.users[id]
    if (user) {
      user.profile.status = 'approved'
      db.notifications.push({
        id: 'n-' + Math.random().toString(36).substr(2, 9),
        user_id: id,
        title: 'Account approved',
        message: 'Your account has been approved. You can now log in and vote.',
        type: 'success',
        read: false,
        created_at: new Date().toISOString()
      })
      saveDB(db)
    }
    return { success: true }
  },
  rejectUser: async (id) => {
    const db = getDB()
    const user = db.users[id]
    if (user) {
      user.profile.status = 'rejected'
      saveDB(db)
    }
    return { success: true }
  },
  createElection: async (body) => {
    const db = getDB()
    const id = 'election-' + Math.random().toString(36).substr(2, 9)
    const newElection = {
      id,
      ...body,
      results_published: false,
      created_at: new Date().toISOString()
    }
    db.elections.push(newElection)
    db.notifications.push({
      id: 'n-' + Math.random().toString(36).substr(2, 9),
      user_id: null,
      title: 'New election announced',
      message: `${body.name} has been scheduled.`,
      type: 'info',
      read: false,
      created_at: new Date().toISOString()
    })
    saveDB(db)
    return newElection
  },
  updateElection: async (id, body) => {
    const db = getDB()
    const idx = db.elections.findIndex((e) => e.id === id)
    if (idx !== -1) {
      db.elections[idx] = { ...db.elections[idx], ...body }
      saveDB(db)
      return db.elections[idx]
    }
    return {}
  },
  deleteElection: async (id) => {
    const db = getDB()
    db.elections = db.elections.filter((e) => e.id !== id)
    db.candidates = db.candidates.filter((c) => c.election_id !== id)
    db.votes = db.votes.filter((v) => v.election_id !== id)
    saveDB(db)
    return { success: true }
  },
  publishResults: async (id) => {
    const db = getDB()
    const election = db.elections.find((e) => e.id === id)
    if (election) {
      election.results_published = true
      db.notifications.push({
        id: 'n-' + Math.random().toString(36).substr(2, 9),
        user_id: null,
        title: 'Results published',
        message: `Election results for ${election.name} are now available.`,
        type: 'success',
        read: false,
        created_at: new Date().toISOString()
      })
      saveDB(db)
    }
    return { success: true }
  },
  addCandidate: async (body) => {
    const db = getDB()
    const id = 'candidate-' + Math.random().toString(36).substr(2, 9)
    const newCandidate = {
      id,
      ...body,
      created_at: new Date().toISOString()
    }
    db.candidates.push(newCandidate)
    saveDB(db)
    return newCandidate
  },
  updateCandidate: async (id, body) => {
    const db = getDB()
    const idx = db.candidates.findIndex((c) => c.id === id)
    if (idx !== -1) {
      db.candidates[idx] = { ...db.candidates[idx], ...body }
      saveDB(db)
      return db.candidates[idx]
    }
    return {}
  },
  deleteCandidate: async (id) => {
    const db = getDB()
    db.candidates = db.candidates.filter((c) => c.id !== id)
    saveDB(db)
    return { success: true }
  },
  markNotificationRead: async (id) => {
    const db = getDB()
    const n = db.notifications.find((n) => n.id === id)
    if (n) { n.read = true; saveDB(db) }
    return { success: true }
  },
  markAllNotificationsRead: async () => {
    const profile = getMockCurrentUserProfile()
    const db = getDB()
    db.notifications.forEach((n) => {
      if (n.user_id === null || n.user_id === profile?.id) n.read = true
    })
    saveDB(db)
    return { success: true }
  },
  createNotification: async (body) => {
    const db = getDB()
    const n = {
      id: 'n-' + Math.random().toString(36).substr(2, 9),
      user_id: body.user_id || null,
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      pinned: body.pinned || false,
      read: false,
      created_at: new Date().toISOString()
    }
    db.notifications.push(n)
    saveDB(db)
    return n
  },
  updateNotification: async (id, body) => {
    const db = getDB()
    const idx = db.notifications.findIndex((n) => n.id === id)
    if (idx !== -1) {
      db.notifications[idx] = { ...db.notifications[idx], ...body }
      saveDB(db)
      return db.notifications[idx]
    }
    return {}
  },
  deleteNotification: async (id) => {
    const db = getDB()
    db.notifications = db.notifications.filter((n) => n.id !== id)
    saveDB(db)
    return { success: true }
  },
  adminListNotifications: async () => {
    const db = getDB()
    return db.notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
}

export const api = supabase.isMock ? mockApi : {
  // public
  listElections: () => request('/api/elections'),
  electionDetail: (id) => request(`/api/elections/${id}`),
  results: (id) => request(`/api/results/${id}`),

  // voter
  profile: () => request('/api/profile', { auth: true }),
  notifications: () => request('/api/notifications', { auth: true }),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'POST', auth: true }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'POST', auth: true }),
  vote: (election_id, candidate_id) =>
    request('/api/vote', { method: 'POST', auth: true, body: { election_id, candidate_id } }),

  // admin
  dashboardStats: () => request('/api/admin/dashboard-stats', { auth: true }),
  adminListUsers: (status) => request(`/api/admin/users${status ? `?status=${status}` : ''}`, { auth: true }),
  approveUser: (id) => request(`/api/admin/users/${id}/approve`, { method: 'POST', auth: true }),
  rejectUser: (id) => request(`/api/admin/users/${id}/reject`, { method: 'POST', auth: true }),
  createElection: (body) => request('/api/admin/elections', { method: 'POST', auth: true, body }),
  updateElection: (id, body) => request(`/api/admin/elections/${id}`, { method: 'PUT', auth: true, body }),
  deleteElection: (id) => request(`/api/admin/elections/${id}`, { method: 'DELETE', auth: true }),
  publishResults: (id) => request(`/api/admin/elections/${id}/publish-results`, { method: 'POST', auth: true }),
  addCandidate: (body) => request('/api/admin/candidates', { method: 'POST', auth: true, body }),
  updateCandidate: (id, body) => request(`/api/admin/candidates/${id}`, { method: 'PUT', auth: true, body }),
  deleteCandidate: (id) => request(`/api/admin/candidates/${id}`, { method: 'DELETE', auth: true }),
  createNotification: (body) => request('/api/admin/notifications', { method: 'POST', auth: true, body }),
  updateNotification: (id, body) => request(`/api/admin/notifications/${id}`, { method: 'PUT', auth: true, body }),
  deleteNotification: (id) => request(`/api/admin/notifications/${id}`, { method: 'DELETE', auth: true }),
  adminListNotifications: () => request('/api/admin/notifications', { auth: true }),
}

