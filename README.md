# HELPDESK AI
### AI-Powered Intelligent Customer Support & Experience Management Platform
**Tagline:** Instant Answers. Smarter Support.

---

## 🌟 Overview
**HELPDESK AI** is a production-ready, full-stack customer support and experience management SaaS platform. It combines Google Gemini AI, automated ticket management, multi-role access control, and real database-driven customer experience analytics.

### Core Problem Solved:
1. Eliminates customer waiting times through 24/7 conversational AI grounded in verified Knowledge Base articles.
2. Automates repetitive manual ticket categorization and priority assignment.
3. Provides smooth human agent escalation when inquiries require personal verification.
4. Unlocks actionable, data-backed operational insights through aggregated PostgreSQL metrics analyzed by Gemini AI.

---

## 🚀 Key Features

### 1. Conversational AI Chatbot (`@google/genai`)
- Real-time conversational interface with multi-turn history.
- Grounded in published Knowledge Base FAQs to prevent hallucinations.
- Automatic intent classification, sentiment detection, and confidence scoring.
- One-click escalation to a human support ticket when human intervention is required.

### 2. Intelligent Ticket Lifecycle
- Automatic AI classification: predicts category, suggests urgency priority (`low`, `medium`, `high`, `urgent`), generates executive summary.
- Full ticket workflow: `open` → `assigned` → `in_progress` → `waiting_for_customer` → `resolved` → `closed`.
- Complete audit activity timeline tracking every state change.
- In-app notification triggers for customers and assigned agents.

### 3. Role-Based Access Control (RBAC)
- **Customer:** Interactive AI chatbot, ticket creation, ticket tracking, response thread, 1-5 star CSAT feedback, searchable knowledge base.
- **Support Agent:** Assigned tickets queue, unassigned ticket claiming, AI diagnostic summary, customer reply form with **Private Internal Staff Notes** toggle.
- **Administrator:** Executive KPI dashboard, user & role management, agent roster, Knowledge Base CMS, and Gemini-powered customer experience analytics.

### 4. Real Data-Backed Analytics
- Aggregates actual database metrics (CSAT scores, average resolution hours, AI resolution rate, category volume, priority distribution).
- Sends live aggregations to Gemini AI to generate top recurring issues, sentiment trends, and actionable operational improvements.

---

## 🛠️ Technology Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, Recharts, React Hot Toast, Date-fns.
- **Backend:** Node.js, Express.js, `@google/genai` (Official Google Gemini SDK), `@supabase/supabase-js`, Zod, Helmet, CORS, Express Rate Limit, Pino.
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) and version-controlled SQL migrations.

---

## 📂 Project Structure
```text
helpdesk-ai/
├── client/                     # React.js Vite Frontend
│   ├── src/
│   │   ├── components/         # Layouts, common badges, modals, tickets
│   │   ├── context/            # AuthContext (with demo switcher) & ThemeContext
│   │   ├── pages/              # Public, Customer, Agent, Admin pages
│   │   ├── services/           # API and endpoint services
│   │   └── routes/             # Protected and Role-based routing
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Gemini, Supabase, and Zod env configuration
│   │   ├── controllers/        # Modular API controllers
│   │   ├── middleware/         # Auth, Role authorization, Zod validation
│   │   ├── prompts/            # System, chat, classification, & analytics prompts
│   │   ├── schemas/            # Zod validation schemas
│   │   └── services/           # Gemini, chat, tickets, analytics, store
├── supabase/
│   ├── migrations/             # 001 to 006 SQL migrations (RLS, indexes, seed)
│   └── config.toml
└── docs/                       # API docs, DB docs, and Setup Guide
```

---

## ⚡ Quick Start
See [SETUP_GUIDE.md](file:///c:/Users/amith/OneDrive/Desktop/antigravity.IDE/docs/SETUP_GUIDE.md) for complete installation steps and environment configuration.

