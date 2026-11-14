# HELPDESK AI – Setup & Deployment Guide
**Tagline:** Instant Answers. Smarter Support.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Google AI Studio API Key**: For Gemini model access (`GEMINI_API_KEY`)
- **Supabase Account**: For production PostgreSQL database and Authentication (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)

---

## 2. Environment Variables Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini API Key
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Security and Rate Limiting
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_UPLOAD_SIZE_MB=5
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 3. Database Migration Deployment
Apply the migration files in order using the Supabase Dashboard SQL Editor or Supabase CLI:
1. `supabase/migrations/001_initial_schema.sql` (Tables & relations)
2. `supabase/migrations/002_indexes.sql` (Search & composite indexes)
3. `supabase/migrations/003_rls_policies.sql` (Row Level Security)
4. `supabase/migrations/004_triggers.sql` (Automated audit logs & notifications)
5. `supabase/migrations/005_storage_policies.sql` (File attachment bucket & rules)
6. `supabase/migrations/006_seed_data.sql` (Default categories & verified FAQs)

---

## 4. Running Locally

### Install Dependencies
```bash
# In the server directory:
cd server
npm install

# In the client directory:
cd ../client
npm install
```

### Start Development Servers
```bash
# Start backend API (Port 5000)
cd server
npm run dev

# Start frontend (Port 5173)
cd ../client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 5. Instant Test Persona Accounts
For instant evaluation without creating accounts manually, use the 1-click persona switcher on the navigation bar or login page:
- **Customer Persona:** David Miller (`customer@helpdesk.ai`)
- **Agent Persona:** Alex Rivera (`agent@helpdesk.ai`)
- **Admin Persona:** Sarah Connor (`admin@helpdesk.ai`)

---

## 6. Production Deployment Options
- **Frontend:** Deploy `client/` to Vercel or Cloudflare Pages with build command `npm run build` and output directory `dist`.
- **Backend:** Deploy `server/` to Render, Railway, or AWS Elastic Beanstalk with start command `npm start`.
- **Database:** Supabase managed PostgreSQL instance with RLS enabled.

