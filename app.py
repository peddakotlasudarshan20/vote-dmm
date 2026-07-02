"""
CloudVote backend API.

Auth & the database itself are handled by Supabase (Postgres + email OTP).
This Flask app is the "trusted" layer: it holds the SERVICE ROLE key
(never exposed to the browser) and enforces the business rules that
matter — admin approval, one-vote-per-user, election windows, results
publishing — on top of the Row Level Security already set in schema.sql.
"""
import os
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client

import os
from functools import wraps
from datetime import datetime, timezone, timedelta

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

is_placeholder = (
    not SUPABASE_URL 
    or not SUPABASE_SERVICE_KEY 
    or "YOUR-PROJECT-REF" in SUPABASE_URL 
    or "YOUR-SERVICE-ROLE" in SUPABASE_SERVICE_KEY
)

if is_placeholder:
    print("Running CloudVote backend in Mock/Demo Mode (In-Memory Database).")

    # In-memory database initialization
    now = datetime.now(timezone.utc)
    one_day_ago = (now - timedelta(days=1)).isoformat()
    five_days_from_now = (now + timedelta(days=5)).isoformat()
    two_days_from_now = (now + timedelta(days=2)).isoformat()
    five_days_ago = (now - timedelta(days=5)).isoformat()

    MOCK_DB = {
        "profiles": [
            {
                "id": "admin-id",
                "full_name": "System Administrator",
                "email": "admin@example.com",
                "mobile": "9876543210",
                "voter_id": "ADMIN001",
                "role": "admin",
                "status": "approved",
                "created_at": one_day_ago
            }
        ],
        "elections": [
            {
                "id": "election-1",
                "name": "Student Council General Election 2026",
                "description": "Vote for your next President and General Secretary of the Student Council. Every approved student is eligible to cast exactly one vote.",
                "banner_url": "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=600",
                "start_time": one_day_ago,
                "end_time": five_days_from_now,
                "results_published": False,
                "created_at": one_day_ago
            },
            {
                "id": "election-2",
                "name": "Sports Club Presidency 2026",
                "description": "Selection for the captain and president of the official university sports club. Active campaign is open until the start date.",
                "banner_url": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600",
                "start_time": two_days_from_now,
                "end_time": five_days_from_now,
                "results_published": False,
                "created_at": one_day_ago
            },
            {
                "id": "election-3",
                "name": "Alumni Association Representative",
                "description": "Annual election for the alumni representative on the university executive board. Voting is closed.",
                "banner_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
                "start_time": five_days_ago,
                "end_time": one_day_ago,
                "results_published": True,
                "created_at": five_days_ago
            }
        ],
        "candidates": [
            {
                "id": "candidate-1",
                "election_id": "election-1",
                "name": "Jane Doe",
                "party_name": "Progressive Students Union",
                "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
                "biography": "Jane is a senior studying Political Science. She has served as Vice President and aims to improve campus green spaces and student housing representation.",
                "age": 21,
                "qualification": "B.A. Political Science",
                "experience": "Student Representative (2 years)",
                "created_at": one_day_ago
            },
            {
                "id": "candidate-2",
                "election_id": "election-1",
                "name": "John Smith",
                "party_name": "Alliance for Change",
                "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                "biography": "John is an Engineering student focused on leveraging technology to digitize campus services and increase transparency in funding allocation.",
                "age": 22,
                "qualification": "B.Tech Computer Science",
                "experience": "Club President (1 year)",
                "created_at": one_day_ago
            },
            {
                "id": "candidate-3",
                "election_id": "election-2",
                "name": "Alice Johnson",
                "party_name": "Sports First",
                "photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                "biography": "Alice is a track athlete who wants to secure more funding for local tournaments and improve gym equipment access times.",
                "age": 20,
                "qualification": "B.Sc Sports Science",
                "experience": "Varsity Captain (2 years)",
                "created_at": one_day_ago
            },
            {
                "id": "candidate-4",
                "election_id": "election-2",
                "name": "Bob Lee",
                "party_name": "Fit & Fair",
                "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                "biography": "Bob believes in sports for all and is advocating for recreational leagues that allow everyone, regardless of skill level, to participate.",
                "age": 23,
                "qualification": "B.B.A",
                "experience": "Recreation Organizer",
                "created_at": one_day_ago
            },
            {
                "id": "candidate-5",
                "election_id": "election-3",
                "name": "Charlie Brown",
                "party_name": "Legacy Union",
                "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
                "biography": "Charlie graduated in 2018 and has since mentored dozens of junior students. He wishes to build stronger networking platforms.",
                "age": 29,
                "qualification": "M.B.A",
                "experience": "Alumni Representative",
                "created_at": five_days_ago
            },
            {
                "id": "candidate-6",
                "election_id": "election-3",
                "name": "Diana Prince",
                "party_name": "Future Alumni",
                "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                "biography": "Diana is a software architect who graduated in 2020. Her focus is on increasing alumni-student internships and research grants.",
                "age": 27,
                "qualification": "M.S. Software Engineering",
                "experience": "Industry Mentor",
                "created_at": five_days_ago
            }
        ],
        "votes": [
            { "id": "v-1", "election_id": "election-3", "candidate_id": "candidate-5", "voter_id": "voter-seed-1", "reference_id": "A9B8C7D6E5", "created_at": one_day_ago },
            { "id": "v-2", "election_id": "election-3", "candidate_id": "candidate-5", "voter_id": "voter-seed-2", "reference_id": "F1E2D3C4B5", "created_at": one_day_ago },
            { "id": "v-3", "election_id": "election-3", "candidate_id": "candidate-6", "voter_id": "voter-seed-3", "reference_id": "J0H8G7F6E5", "created_at": one_day_ago }
        ],
        "notifications": [
            {
                "id": "n-1",
                "user_id": None,
                "title": "Alumni Association Representative Results Published",
                "message": "The election results for Alumni Association Representative have been published. View the dashboard to see details.",
                "type": "success",
                "read": False,
                "created_at": one_day_ago
            },
            {
                "id": "n-2",
                "user_id": None,
                "title": "Student Council Election Live",
                "message": "The Student Council General Election 2026 is officially open for voting. Cast your vote now!",
                "type": "info",
                "read": False,
                "created_at": one_day_ago
            }
        ],
        "audit_log": []
    }

    class MockResponse:
        def __init__(self, data, count=None):
            self.data = data
            self.count = count if count is not None else (len(data) if isinstance(data, list) else 1 if data else 0)

    class MockQuery:
        def __init__(self, table, db):
            self.table = table
            self.db = db
            self.filters = []
            self.or_filters = []
            self._order_by = None
            self._desc = False
            self._limit = None
            self._single = False
            self._insert_data = None
            self._update_data = None
            self._delete = False

        def select(self, col, count=None):
            return self

        def eq(self, col, val):
            self.filters.append((col, val))
            return self

        def or_(self, expr):
            self.or_filters.append(expr)
            return self

        def order(self, col, desc=False):
            self._order_by = col
            self._desc = desc
            return self

        def limit(self, n):
            self._limit = n
            return self

        def single(self):
            self._single = True
            return self

        def insert(self, data):
            self._insert_data = data
            return self

        def update(self, data):
            self._update_data = data
            return self

        def delete(self):
            self._delete = True
            return self

        def execute(self):
            data = self.db.setdefault(self.table, [])
            
            # Apply inserts
            if self._insert_data:
                import uuid
                if isinstance(self._insert_data, list):
                    new_rows = []
                    for row in self._insert_data:
                        row_copy = dict(row)
                        if "id" not in row_copy:
                            row_copy["id"] = str(uuid.uuid4())
                        if "created_at" not in row_copy:
                            row_copy["created_at"] = datetime.now(timezone.utc).isoformat()
                        if "reference_id" not in row_copy and self.table == "votes":
                            import random, string
                            row_copy["reference_id"] = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
                        new_rows.append(row_copy)
                    data.extend(new_rows)
                    res_data = new_rows
                else:
                    row_copy = dict(self._insert_data)
                    if "id" not in row_copy:
                        row_copy["id"] = str(uuid.uuid4())
                    if "created_at" not in row_copy:
                        row_copy["created_at"] = datetime.now(timezone.utc).isoformat()
                    if "reference_id" not in row_copy and self.table == "votes":
                        import random, string
                        row_copy["reference_id"] = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
                    data.append(row_copy)
                    res_data = [row_copy]
                return MockResponse(res_data)

            # Apply updates
            if self._update_data:
                affected = []
                for row in data:
                    match = True
                    for col, val in self.filters:
                        if row.get(col) != val:
                            match = False
                            break
                    if match:
                        row.update(self._update_data)
                        affected.append(row)
                return MockResponse(affected)

            # Apply deletes
            if self._delete:
                new_db_data = []
                affected = []
                for row in data:
                    match = True
                    for col, val in self.filters:
                        if row.get(col) != val:
                            match = False
                            break
                    if match:
                        affected.append(row)
                    else:
                        new_db_data.append(row)
                self.db[self.table] = new_db_data
                return MockResponse(affected)

            # Filter rows
            filtered_data = []
            for row in data:
                match = True
                for col, val in self.filters:
                    if row.get(col) != val:
                        match = False
                        break
                if match:
                    filtered_data.append(row)
            
            # Simple mock for OR filter in notifications: user_id = uid OR user_id IS NULL
            if self.or_filters and self.table == "notifications":
                # For this application, it's always get user notifications
                # we already filtered or will filter. Let's just return all broadcast + user
                pass

            # Apply ordering
            if self._order_by and filtered_data:
                filtered_data.sort(key=lambda x: x.get(self._order_by, ""), reverse=self._desc)

            # Apply limit
            if self._limit and len(filtered_data) > self._limit:
                filtered_data = filtered_data[:self._limit]

            # Inject counts for elections
            if self.table == "elections":
                for e in filtered_data:
                    c_count = len([c for c in self.db.get("candidates", []) if c.get("election_id") == e["id"]])
                    e["candidates"] = [{"count": c_count}]

            if self._single:
                return MockResponse(filtered_data[0] if filtered_data else None)
            return MockResponse(filtered_data)

    class MockUser:
        def __init__(self, id):
            self.id = id

    class MockUserResponse:
        def __init__(self, user):
            self.user = user

    class MockAuth:
        def get_user(self, token):
            if token.startswith("mock-token-"):
                uid = token.split("mock-token-", 1)[1]
                return MockUserResponse(MockUser(uid))
            raise Exception("Invalid token")

    class MockSupabaseClient:
        def __init__(self, db):
            self.auth = MockAuth()
            self.db = db

        def table(self, name):
            return MockQuery(name, self.db)

    sb = MockSupabaseClient(MOCK_DB)

else:
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = Flask(__name__)
CORS(app, origins=[FRONTEND_ORIGIN])


# ---------------------------------------------------------------- helpers
def get_current_user():
    """Read the Supabase JWT and ensure a profile exists."""

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]

    try:
        user_resp = sb.auth.get_user(token)
    except Exception:
        return None

    if not user_resp or not user_resp.user:
        return None

    user = user_resp.user
    uid = user.id

    # Try to load existing profile
    profile = (
        sb.table("profiles")
        .select("*")
        .eq("id", uid)
        .single()
        .execute()
    )

    if profile.data:
        return profile.data

    # Create profile automatically if it doesn't exist
    metadata = user.user_metadata or {}

    new_profile = {
        "id": uid,
        "full_name": metadata.get("full_name", ""),
        "email": user.email,
        "mobile": metadata.get("mobile", ""),
        "voter_id": metadata.get("voter_id", ""),
        "role": "voter",
        "status": "pending_approval",
    }

    sb.table("profiles").insert(new_profile).execute()

    profile = (
        sb.table("profiles")
        .select("*")
        .eq("id", uid)
        .single()
        .execute()
    )

    return profile.data

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return wrapper


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user or user["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return wrapper


def log_action(actor_id, action, details=None):
    sb.table("audit_log").insert(
        {"actor_id": actor_id, "action": action, "details": details or {}}
    ).execute()


def election_status(election):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    start = election["start_time"]
    end = election["end_time"]
    if isinstance(start, str):
        from dateutil import parser
        start = parser.isoparse(start)
        end = parser.isoparse(end)
    if now < start:
        return "upcoming"
    if now > end:
        return "completed"
    return "active"


@app.get("/")
def home():
    return jsonify({"status": "CloudVote API is running"})


# ---------------------------------------------------------------- public
@app.get("/api/elections")
def list_elections():
    res = sb.table("elections").select("*, candidates(count)").order("start_time").execute()
    data = []
    for e in res.data:
        e["status"] = election_status(e)
        e["candidate_count"] = e.get("candidates", [{}])[0].get("count", 0) if e.get("candidates") else 0
        e.pop("candidates", None)
        data.append(e)
    return jsonify(data)


@app.get("/api/elections/<election_id>")
def election_detail(election_id):
    e = sb.table("elections").select("*").eq("id", election_id).single().execute()
    if not e.data:
        return jsonify({"error": "Election not found"}), 404
    e.data["status"] = election_status(e.data)
    candidates = sb.table("candidates").select("*").eq("election_id", election_id).execute()
    return jsonify({"election": e.data, "candidates": candidates.data})


@app.get("/api/results/<election_id>")
def results(election_id):
    e = sb.table("elections").select("*").eq("id", election_id).single().execute()
    if not e.data:
        return jsonify({"error": "Election not found"}), 404
    if not e.data["results_published"]:
        return jsonify({"published": False}), 200

    candidates = sb.table("candidates").select("*").eq("election_id", election_id).execute().data
    votes = sb.table("votes").select("candidate_id").eq("election_id", election_id).execute().data
    total_votes = len(votes)
    counts = {}
    for v in votes:
        counts[v["candidate_id"]] = counts.get(v["candidate_id"], 0) + 1

    ranked = []
    for c in candidates:
        vc = counts.get(c["id"], 0)
        ranked.append({
            "candidate_id": c["id"],
            "name": c["name"],
            "party_name": c["party_name"],
            "photo_url": c["photo_url"],
            "votes": vc,
            "percentage": round((vc / total_votes) * 100, 2) if total_votes else 0,
        })
    ranked.sort(key=lambda x: x["votes"], reverse=True)

    total_approved = sb.table("profiles").select("id", count="exact").eq("status", "approved").execute().count or 0
    turnout = round((total_votes / total_approved) * 100, 2) if total_approved else 0

    return jsonify({
        "published": True,
        "election_name": e.data["name"],
        "total_votes": total_votes,
        "turnout_percentage": turnout,
        "winner": ranked[0] if ranked else None,
        "rankings": ranked,
    })


# ---------------------------------------------------------------- voter
@app.get("/api/profile")
@require_auth
def profile():
    return jsonify(request.current_user)


@app.get("/api/notifications")
@require_auth
def notifications():
    uid = request.current_user["id"]
    res = (
        sb.table("notifications")
        .select("*")
        .or_(f"user_id.eq.{uid},user_id.is.null")
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )
    return jsonify(res.data)


@app.post("/api/vote")
@require_auth
def cast_vote():
    user = request.current_user
    body = request.get_json(force=True) or {}
    election_id = body.get("election_id")
    candidate_id = body.get("candidate_id")
    if not election_id or not candidate_id:
        return jsonify({"error": "election_id and candidate_id are required"}), 400

    if user["status"] != "approved":
        return jsonify({"error": "Your account is not approved yet."}), 403

    e = sb.table("elections").select("*").eq("id", election_id).single().execute()
    if not e.data:
        return jsonify({"error": "Election not found"}), 404
    status = election_status(e.data)
    if status == "upcoming":
        return jsonify({"error": "Election has not started yet."}), 400
    if status == "completed":
        return jsonify({"error": "Election has ended."}), 400

    existing = (
        sb.table("votes").select("id")
        .eq("election_id", election_id).eq("voter_id", user["id"]).execute()
    )
    if existing.data:
        return jsonify({"error": "You have already cast your vote."}), 409

    candidate = sb.table("candidates").select("id").eq("id", candidate_id).eq("election_id", election_id).execute()
    if not candidate.data:
        return jsonify({"error": "Invalid candidate for this election."}), 400

    inserted = sb.table("votes").insert({
        "election_id": election_id,
        "candidate_id": candidate_id,
        "voter_id": user["id"],
    }).execute()

    log_action(user["id"], "vote_cast", {"election_id": election_id})

    row = inserted.data[0]
    return jsonify({
        "success": True,
        "reference_id": row["reference_id"],
        "election_name": e.data["name"],
        "voted_at": row["created_at"],
    })


# ---------------------------------------------------------------- admin
@app.get("/api/admin/dashboard-stats")
@require_admin
def dashboard_stats():
    def count(table, **filters):
        q = sb.table(table).select("id", count="exact")
        for k, v in filters.items():
            q = q.eq(k, v)
        return q.execute().count or 0

    return jsonify({
        "registered_users": count("profiles"),
        "pending_approvals": count("profiles", status="pending_approval"),
        "approved_users": count("profiles", status="approved"),
        "elections": count("elections"),
        "candidates": count("candidates"),
        "votes_cast": count("votes"),
    })


@app.get("/api/admin/users")
@require_admin
def admin_list_users():
    status = request.args.get("status")
    q = sb.table("profiles").select("*").order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    return jsonify(q.execute().data)


@app.post("/api/admin/users/<user_id>/approve")
@require_admin
def approve_user(user_id):
    sb.table("profiles").update({"status": "approved"}).eq("id", user_id).execute()
    sb.table("notifications").insert({
        "user_id": user_id, "title": "Account approved",
        "message": "Your account has been approved. You can now log in and vote.",
        "type": "success",
    }).execute()
    log_action(request.current_user["id"], "approve_user", {"user_id": user_id})
    return jsonify({"success": True})


@app.post("/api/admin/users/<user_id>/reject")
@require_admin
def reject_user(user_id):
    sb.table("profiles").update({"status": "rejected"}).eq("id", user_id).execute()
    log_action(request.current_user["id"], "reject_user", {"user_id": user_id})
    return jsonify({"success": True})


@app.post("/api/admin/elections")
@require_admin
def create_election():
    body = request.get_json(force=True)
    res = sb.table("elections").insert({
        "name": body["name"],
        "description": body.get("description", ""),
        "banner_url": body.get("banner_url"),
        "start_time": body["start_time"],
        "end_time": body["end_time"],
    }).execute()
    election_id = res.data[0]["id"]
    sb.table("notifications").insert({
        "user_id": None, "title": "New election announced",
        "message": f"{body['name']} has been scheduled.", "type": "info",
    }).execute()
    return jsonify(res.data[0]), 201


@app.put("/api/admin/elections/<election_id>")
@require_admin
def update_election(election_id):
    body = request.get_json(force=True)
    allowed = {k: v for k, v in body.items() if k in
               ("name", "description", "banner_url", "start_time", "end_time")}
    res = sb.table("elections").update(allowed).eq("id", election_id).execute()
    return jsonify(res.data[0] if res.data else {})


@app.delete("/api/admin/elections/<election_id>")
@require_admin
def delete_election(election_id):
    sb.table("elections").delete().eq("id", election_id).execute()
    return jsonify({"success": True})


@app.post("/api/admin/elections/<election_id>/publish-results")
@require_admin
def publish_results(election_id):
    sb.table("elections").update({"results_published": True}).eq("id", election_id).execute()
    sb.table("notifications").insert({
        "user_id": None, "title": "Results published",
        "message": "Election results are now available.", "type": "success",
    }).execute()
    log_action(request.current_user["id"], "publish_results", {"election_id": election_id})
    return jsonify({"success": True})


@app.post("/api/admin/candidates")
@require_admin
def add_candidate():
    body = request.get_json(force=True)
    res = sb.table("candidates").insert(body).execute()
    return jsonify(res.data[0]), 201


@app.put("/api/admin/candidates/<candidate_id>")
@require_admin
def update_candidate(candidate_id):
    body = request.get_json(force=True)
    res = sb.table("candidates").update(body).eq("id", candidate_id).execute()
    return jsonify(res.data[0] if res.data else {})


@app.delete("/api/admin/candidates/<candidate_id>")
@require_admin
def delete_candidate(candidate_id):
    sb.table("candidates").delete().eq("id", candidate_id).execute()
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
