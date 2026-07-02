import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('YOUR-PROJECT-REF') || 
  supabaseAnonKey.includes('YOUR-ANON-PUBLIC-KEY')

let supabaseClient

if (isPlaceholder) {
  console.warn('Running CloudVote in Frontend DEMO Mode (Local Storage Mock).')

  // Set up seed data in localStorage if not present
  const seedData = {
    users: {
      'admin-id': {
        id: 'admin-id',
        email: 'admin@example.com',
        password: 'password123',
        email_confirmed: true,
        profile: {
          id: 'admin-id',
          full_name: 'System Administrator',
          email: 'admin@example.com',
          mobile: '9876543210',
          voter_id: 'ADMIN001',
          role: 'admin',
          status: 'approved',
          created_at: new Date().toISOString()
        }
      }
    },
    candidates: [
      {
        id: 'candidate-1',
        election_id: 'election-1',
        name: 'Jane Doe',
        party_name: 'Progressive Students Union',
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        biography: 'Jane is a senior studying Political Science. She has served as Vice President and aims to improve campus green spaces and student housing representation.',
        age: 21,
        qualification: 'B.A. Political Science',
        experience: 'Student Representative (2 years)',
        created_at: new Date().toISOString()
      },
      {
        id: 'candidate-2',
        election_id: 'election-1',
        name: 'John Smith',
        party_name: 'Alliance for Change',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        biography: 'John is an Engineering student focused on leveraging technology to digitize campus services and increase transparency in funding allocation.',
        age: 22,
        qualification: 'B.Tech Computer Science',
        experience: 'Club President (1 year)',
        created_at: new Date().toISOString()
      },
      {
        id: 'candidate-3',
        election_id: 'election-2',
        name: 'Alice Johnson',
        party_name: 'Sports First',
        photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        biography: 'Alice is a track athlete who wants to secure more funding for local tournaments and improve gym equipment access times.',
        age: 20,
        qualification: 'B.Sc Sports Science',
        experience: 'Varsity Captain (2 years)',
        created_at: new Date().toISOString()
      },
      {
        id: 'candidate-4',
        election_id: 'election-2',
        name: 'Bob Lee',
        party_name: 'Fit & Fair',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        biography: 'Bob believes in sports for all and is advocating for recreational leagues that allow everyone, regardless of skill level, to participate.',
        age: 23,
        qualification: 'B.B.A',
        experience: 'Recreation Organizer',
        created_at: new Date().toISOString()
      },
      {
        id: 'candidate-5',
        election_id: 'election-3',
        name: 'Charlie Brown',
        party_name: 'Legacy Union',
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        biography: 'Charlie graduated in 2018 and has since mentored dozens of junior students. He wishes to build stronger networking platforms.',
        age: 29,
        qualification: 'M.B.A',
        experience: 'Alumni Representative',
        created_at: new Date().toISOString()
      },
      {
        id: 'candidate-6',
        election_id: 'election-3',
        name: 'Diana Prince',
        party_name: 'Future Alumni',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        biography: 'Diana is a software architect who graduated in 2020. Her focus is on increasing alumni-student internships and research grants.',
        age: 27,
        qualification: 'M.S. Software Engineering',
        experience: 'Industry Mentor',
        created_at: new Date().toISOString()
      }
    ]
  }

  const getDB = () => {
    const raw = localStorage.getItem('cloudvote_mock_db')
    if (!raw) {
      localStorage.setItem('cloudvote_mock_db', JSON.stringify(seedData))
      return seedData
    }
    return JSON.parse(raw)
  }

  const saveDB = (db) => {
    localStorage.setItem('cloudvote_mock_db', JSON.stringify(db))
  }

  const listeners = []
  let currentSession = null

  // Restore session from localStorage if exists
  const storedSession = localStorage.getItem('cloudvote_mock_session')
  if (storedSession) {
    try {
      currentSession = JSON.parse(storedSession)
    } catch (e) {
      currentSession = null
    }
  }

  const notifyListeners = (event, session) => {
    listeners.forEach((cb) => cb(event, session))
  }

  supabaseClient = {
    isMock: true,
    auth: {
      signUp: async ({ email, password, options = {} }) => {
        const db = getDB()
        if (Object.values(db.users).some((u) => u.email === email)) {
          return { data: null, error: { message: 'User already exists' } }
        }
        const id = 'user-' + Math.random().toString(36).substr(2, 9)
        const isEmailAdmin = email.includes('admin') || email === 'admin@example.com'
        const newUser = {
          id,
          email,
          password,
          email_confirmed: false,
          profile: {
            id,
            email,
            full_name: options.data?.full_name || '',
            mobile: options.data?.mobile || '',
            voter_id: options.data?.voter_id || '',
            role: isEmailAdmin ? 'admin' : 'voter',
            status: isEmailAdmin ? 'approved' : 'pending_approval',
            created_at: new Date().toISOString()
          }
        }
        db.users[id] = newUser
        saveDB(db)
        return { data: { user: { id, email } }, error: null }
      },
      signInWithPassword: async ({ email, password }) => {
        const db = getDB()
        const user = Object.values(db.users).find((u) => u.email === email)
        if (!user || user.password !== password) {
          return { data: null, error: { message: 'Invalid login credentials' } }
        }
        if (!user.email_confirmed) {
          return { data: null, error: { message: 'Email not confirmed' } }
        }
        currentSession = {
          access_token: 'mock-token-' + user.id,
          user: { id: user.id, email: user.email }
        }
        localStorage.setItem('cloudvote_mock_session', JSON.stringify(currentSession))
        notifyListeners('SIGNED_IN', currentSession)
        return { data: { session: currentSession }, error: null }
      },
      verifyOtp: async ({ email, token }) => {
        const db = getDB()
        const user = Object.values(db.users).find((u) => u.email === email)
        if (!user) {
          return { data: null, error: { message: 'User not found' } }
        }
        user.email_confirmed = true
        saveDB(db)

        currentSession = {
          access_token: 'mock-token-' + user.id,
          user: { id: user.id, email: user.email }
        }
        localStorage.setItem('cloudvote_mock_session', JSON.stringify(currentSession))
        notifyListeners('SIGNED_IN', currentSession)
        return { data: { session: currentSession }, error: null }
      },
      resend: async ({ email }) => {
        return { error: null }
      },
      getSession: async () => {
        return { data: { session: currentSession }, error: null }
      },
      onAuthStateChange: (cb) => {
        listeners.push(cb)
        // Trigger initial callback
        setTimeout(() => cb(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession), 0)
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(cb)
                if (idx !== -1) listeners.splice(idx, 1)
              }
            }
          }
        }
      },
      signOut: async () => {
        currentSession = null
        localStorage.removeItem('cloudvote_mock_session')
        notifyListeners('SIGNED_OUT', null)
        return { error: null }
      },
      updateUser: async ({ password }) => {
        if (!currentSession) return { error: { message: 'No active session' } }
        const db = getDB()
        const user = db.users[currentSession.user.id]
        if (user) {
          user.password = password
          saveDB(db)
        }
        return { error: null }
      }
    },
    from: (table) => {
      return {
        select: (columns) => {
          const db = getDB()
          let data = db[table] || []

          // Simple mock for filtering / chaining
          const chain = {
            eq: (col, val) => {
              data = data.filter((row) => row[col] === val)
              return chain
            },
            order: (col, opts = {}) => {
              const asc = opts.ascending !== false
              data.sort((a, b) => {
                if (a[col] < b[col]) return asc ? -1 : 1
                if (a[col] > b[col]) return asc ? 1 : -1
                return 0
              })
              return chain
            },
            single: async () => {
              if (data.length === 0) {
                return { data: null, error: { message: 'No row found' } }
              }
              return { data: data[0], error: null }
            },
            then: (resolve) => {
              // Resolve as promise
              resolve({ data, error: null })
              return Promise.resolve({ data, error: null })
            }
          }
          return chain
        }
      }
    }
  }
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient

