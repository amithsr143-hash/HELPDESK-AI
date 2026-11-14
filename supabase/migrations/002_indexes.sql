-- 002_indexes.sql: Performance and Search Indexes for HELPDESK AI

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_agent_id ON public.tickets(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON public.tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_agent_status ON public.tickets(assigned_agent_id, status);

-- Conversations and Messages indexes
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Ticket responses & activity indexes
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON public.ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_created_at ON public.ticket_responses(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_ticket_id ON public.ticket_activity(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_activity_created_at ON public.ticket_activity(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Knowledge base indexes
CREATE INDEX IF NOT EXISTS idx_kb_published ON public.knowledge_base(is_published);
CREATE INDEX IF NOT EXISTS idx_kb_category_id ON public.knowledge_base(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON public.knowledge_base USING GIN(keywords);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_ticket_id ON public.feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_feedback_customer_id ON public.feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON public.ticket_attachments(ticket_id);

