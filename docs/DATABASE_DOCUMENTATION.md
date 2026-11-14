# HELPDESK AI – Database Architecture & Security
**Engine:** Supabase PostgreSQL  
**Migrations Directory:** `/supabase/migrations/`

---

## 1. Schema Tables

### `public.profiles`
Stores extended user profile and role assignment.
- `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `full_name TEXT NOT NULL`
- `email TEXT NOT NULL UNIQUE`
- `role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin'))`
- `avatar_url TEXT`
- `phone TEXT`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

### `public.ticket_categories`
Classification categories for tickets and Knowledge Base.
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name TEXT NOT NULL UNIQUE`
- `description TEXT`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`

### `public.tickets`
Core support ticket records.
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `ticket_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE`
- `customer_id UUID REFERENCES public.profiles(id)`
- `assigned_agent_id UUID REFERENCES public.profiles(id)`
- `category_id UUID REFERENCES public.ticket_categories(id)`
- `subject TEXT NOT NULL`, `description TEXT NOT NULL`
- `ai_summary TEXT`, `ai_sentiment TEXT`, `ai_suggested_priority TEXT`
- `priority TEXT NOT NULL DEFAULT 'medium'`
- `status TEXT NOT NULL DEFAULT 'open'`
- `resolution_notes TEXT`, `resolved_at TIMESTAMPTZ`

### `public.ticket_responses`
Public replies and private internal notes.
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE`
- `sender_id UUID REFERENCES public.profiles(id)`
- `message TEXT NOT NULL`
- `is_internal BOOLEAN NOT NULL DEFAULT FALSE`

### `public.conversations` & `public.messages`
AI Chatbot multi-turn conversations and message logs.
- Stores customer, AI, agent, or system messages.
- `metadata JSONB` holds detected intent, confidence score, sentiment, and escalation recommendations.

### `public.knowledge_base`
Curated FAQs used for AI grounding.
- `is_published BOOLEAN NOT NULL DEFAULT FALSE`
- `keywords TEXT[]`

### `public.feedback`
Customer satisfaction ratings (1-5 stars) and optional feedback comments on resolved tickets.

### `public.ticket_activity`
Audit log recording ticket status changes, agent assignments, and priority adjustments.

---

## 2. Row Level Security (RLS) & Isolation Policies
- **Role Isolation:** Enforced via `public.get_auth_role()` helper function.
- **Customers:** Restricted to reading and updating their own tickets, conversations, and public ticket responses.
- **Support Agents:** Granted access to assigned tickets, queue tickets, and customer contact info required for resolution.
- **Internal Notes:** Customers cannot query `ticket_responses` where `is_internal = TRUE`.
- **Knowledge Base:** Only articles with `is_published = TRUE` are accessible to customers and public AI grounding.

---

## 3. Database Triggers & Automations
- `trg_ticket_lifecycle`: Automatically writes an audit entry to `ticket_activity` whenever ticket status, priority, or assignment changes.
- `on_auth_user_created`: Automatically creates a corresponding row in `public.profiles` whenever a user registers in `auth.users`.
- `handle_updated_at`: Automatically synchronizes `updated_at = NOW()` on row updates.

