# CloudVote — Setup Guide

This build gives you the full flow:
Home → Register → Email OTP → Pending Approval → Admin Approves → Login →
Dashboard → Election Details → Candidate List → Vote → Confirmation →
Vote Success → Results (after publish) — plus a working Admin side
(approvals, election management, candidate management, dashboard stats,
notifications, audit log).

**Not included yet** (call these out to your team as Phase 2 — they're
genuinely separate mini-projects): PDF/Excel/CSV export of reports, SMS
OTP, and a scrolling notification banner. The data (audit_log table,
notifications table) is already there to build on.

---

## 1. Create your Supabase project

1. Go to supabase.com → New project. Pick any name/region, save the DB password somewhere.
2. Once it's ready: **SQL Editor → New query** → paste the entire contents of
   `supabase/schema.sql` → Run. This creates every table, security rule, and
   the results function in one go.
3. **Project Settings → API** → copy:
   - `Project URL` → goes in both `.env` files below as `SUPABASE_URL`
   - `anon public` key → frontend `.env` only
   - `service_role` key → backend `.env` only (**never** put this in the frontend — it bypasses all security rules)

### Turn on real OTP codes (not a link)
By default Supabase emails a confirmation *link*. You asked for an actual
6-digit code screen, so:
- **Authentication → Email Templates → Confirm signup**
- Replace the body so it shows `{{ .Token }}` (a 6-digit code) instead of
  `{{ .ConfirmationURL }}`. Supabase's docs have a ready-made template —
  search "Supabase OTP email template" if you want to copy one.

### Make yourself admin
1. Register through the app once (as yourself).
2. In Supabase: **Table Editor → profiles** → find your row → set
   `role` to `admin` and `status` to `approved`. Now you can log in and
   see the Admin dashboard.

---

## 2. Backend (Flask)

```
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # then fill in SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
python app.py
```
Runs on `http://localhost:5000`.

## 3. Frontend (React + Vite + Tailwind)

```
cd frontend
npm install
copy .env.example .env         # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```
Runs on `http://localhost:5173`.

Open it, register, grab the OTP from your email, get approved (step above),
log in, and you have the full flow working end to end.

---

## 4. How to merge this into your local repo — step by step

You're confused about this because you already have a project on disk
*and* a teammate's merged PR, and now a third batch of files (this one)
arriving separately. Here's the clean way to do it, no guesswork:

### Step A — get your local copy fully up to date first
Open a terminal in `C:\Users\Sudarshan\Desktop\Online-Voting-System` and run:
```
git status
git add .
git commit -m "WIP before CloudVote rebuild"   (only if it says you have uncommitted changes)
git checkout main
git pull origin main
```
This pulls in Shalini's merged PR so you're not about to overwrite her work blindly.

### Step B — work on a new branch (never edit main directly)
```
git checkout -b feature/supabase-integration
```

### Step C — bring in these new files
1. Download the zip I give you at the end of this message.
2. Extract it — you'll see `frontend/`, `backend/`, `supabase/`, `.gitignore`, this file.
3. Copy `frontend/` and `backend/` from the extracted zip **into** your
   project folder, overwriting when prompted. (`supabase/schema.sql` and
   `.gitignore` are new folders/files — just drop them in at the root.)
4. Your existing `frontend/online-voting-frontend/online-voting-frontend/`
   folder is duplicate leftover scaffolding (looks like `npm create vite`
   was run twice by mistake) — delete that whole nested folder, it isn't
   used by anything.

### Step D — install and test locally
Follow sections 2 and 3 above. Fix anything that breaks *before* you push.

### Step E — commit and push your branch
```
git add .
git commit -m "Integrate Supabase auth/DB and build full voting flow"
git push origin feature/supabase-integration
```

### Step F — open a Pull Request
On GitHub, you'll see a banner to open a PR from `feature/supabase-integration`
into `main`. Since you're the repo owner, you can merge it yourself once you've
reviewed the diff — or better, since you have 3 teammates, ask one of them
to review it first, same as Shalini's PR was reviewed. This is exactly the
same flow you already used once, just with you now sending the PR instead of
receiving it.

### Step G — everyone else pulls the update
Each teammate runs `git checkout main && git pull` to get the new code,
then `npm install` again in `frontend/` (new dependencies were added) and
`pip install -r requirements.txt` again in `backend/` (new dependencies).

### Sharing secrets with your team
`.env` files are gitignored on purpose (they hold private keys) — send your
teammates the actual Supabase URL/keys directly (WhatsApp/Slack/etc.), not
through GitHub. Each of them creates their own local `.env` from the
`.env.example` templates using those values.

---

## 5. Where things live (for your own orientation)
```
backend/app.py           – all API routes, one-vote enforcement, admin actions
supabase/schema.sql      – tables, row-level security, results function
frontend/src/pages/      – every screen in the workflow
frontend/src/pages/admin/– admin screens
frontend/src/lib/        – supabase client + backend API wrapper
frontend/src/context/    – auth/session state, used everywhere via useAuth()
```
