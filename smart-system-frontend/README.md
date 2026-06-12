# Smart System Investment — React Frontend

A world-class fintech investment platform frontend built with React + Vite,
wired directly to your existing Laravel backend.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build tool / Dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP client (with Sanctum CSRF) |
| Zustand | Global state (auth) |
| Recharts | Charts & analytics |
| React Icons | Icon library |
| React Hot Toast | Notifications |

---

## Project Structure

```
src/
├── App.jsx                    # All routes + guards
├── main.jsx                   # Entry point
├── index.css                  # Global design system
├── layouts/
│   ├── PublicLayout.jsx/css    # Navbar + Footer
│   ├── InvestorLayout.jsx/css  # Investor sidebar + topbar
│   └── AdminLayout.jsx/css     # Admin sidebar + topbar
├── pages/
│   ├── public/                 # Home, About, Plans, HowItWorks, FAQ, Contact, Login, Register
│   ├── investor/               # Dashboard, Investments, Deposits, Withdrawals, Messages, Profile, Notifications, Referrals
│   └── admin/                  # Dashboard, Users, Investments, Deposits, Withdrawals, Messages, Announcements, Analytics, Plans
├── services/
│   └── api.js                  # All Axios calls mapped to your Laravel routes
├── store/
│   └── authStore.js            # Zustand auth store (persisted)
└── layouts/
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- Your Laravel backend running at `http://localhost:8000`

### 2. Install dependencies

```bash
cd smart-system-frontend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set VITE_API_URL to your Laravel URL
```

### 4. Laravel Backend Requirements

Add these to your Laravel `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

In your `.env`:
```
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

In `app/Http/Kernel.php` — ensure Sanctum middleware is on your API:
```php
\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
```

### 5. Auth — Expected Response Format

**POST /login** should return:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "investor",   // or "admin"
    "balance": 5000,
    "referral_code": "REF123"
  }
}
```

**GET /investor-investment/dashboard** should return:
```json
{
  "stats": {
    "balance": 5000,
    "total_invested": 8000,
    "total_profit": 1200,
    "withdrawable": 1200,
    "active_plans": 2,
    "total_withdrawn": 500
  },
  "active_investments": [...],
  "recent_deposits": [...],
  "announcements": [...],
  "chart_data": [{ "month": "Jan", "profit": 320 }, ...]
}
```

**GET /admin/dashboard** should return:
```json
{
  "stats": {
    "total_investors": 150,
    "active_investors": 132,
    "total_investments": 420000,
    "total_deposits": 540000,
    "total_withdrawals": 120000,
    "pending_withdrawals": 5,
    "company_revenue": 28000,
    "monthly_profit": 18000
  },
  "pending_withdrawals": [...],
  "recent_investors": [...],
  "chart_data": [...]
}
```

### 6. Start Development Server

```bash
npm run dev
# App runs at http://localhost:5173
```

### 7. Build for Production

```bash
npm run build
# Output in dist/
```

---

## Routes

### Public
| Path | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/plans` | Investment Plans |
| `/how-it-works` | How It Works |
| `/faq` | FAQ |
| `/contact` | Contact |
| `/login` | Login |
| `/register` | Multi-step Registration |

### Investor (requires auth + `investor` role)
| Path | Page |
|---|---|
| `/investor/dashboard` | Main dashboard |
| `/investor/investments` | Investments + Plans |
| `/investor/deposits` | Deposits |
| `/investor/withdrawals` | Withdrawals |
| `/investor/messages` | Support messages |
| `/investor/notifications` | Notifications |
| `/investor/referrals` | Referral program |
| `/investor/profile` | Profile settings |

### Admin (requires auth + `admin` role)
| Path | Page |
|---|---|
| `/admin/dashboard` | Control center |
| `/admin/users` | Investor management |
| `/admin/users/:id` | Investor detail |
| `/admin/investments` | All investments |
| `/admin/deposits` | Deposit approvals |
| `/admin/withdrawals` | Withdrawal approvals |
| `/admin/messages` | Support inbox |
| `/admin/announcements` | Announcements |
| `/admin/analytics` | Charts & analytics |
| `/admin/plans` | Investment plans |

---

## Key Design Decisions

- **Auth guards**: `PrivateRoute` redirects unauthenticated users to `/login`. 
  `GuestRoute` redirects authenticated users to their dashboard.
- **Role-based routing**: After login, users are redirected based on `user.role` 
  (`admin` → `/admin/dashboard`, others → `/investor/dashboard`).
- **API layer**: All calls in `src/services/api.js` — mapped 1:1 to your Laravel routes.
  Never hardcode URLs elsewhere.
- **Charts**: Recharts with fallback sample data — pages won't break if API returns empty arrays.
- **CSRF**: Axios interceptor automatically attaches `XSRF-TOKEN` from Laravel's cookie.
