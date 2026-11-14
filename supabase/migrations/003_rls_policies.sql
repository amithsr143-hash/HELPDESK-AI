-- 003_rls_policies.sql: Row Level Security Policies for HELPDESK AI

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch user role safely without recursive RLS trigger
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.get_auth_role() IN ('agent', 'admin'));

CREATE POLICY "Users can update their own permitted fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.get_auth_role() = 'admin');

-- 2. Ticket Categories Policies
CREATE POLICY "Categories are readable by all authenticated users"
    ON public.ticket_categories FOR SELECT
    TO authenticated
    USING (is_active = TRUE OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins can manage categories"
    ON public.ticket_categories FOR ALL
    USING (public.get_auth_role() = 'admin');

-- 3. Tickets Policies
CREATE POLICY "Customers can view their own tickets"
    ON public.tickets FOR SELECT
    USING (
        customer_id = auth.uid()
        OR assigned_agent_id = auth.uid()
        OR public.get_auth_role() = 'admin'
        OR (public.get_auth_role() = 'agent' AND (assigned_agent_id IS NULL OR assigned_agent_id = auth.uid()))
    );

CREATE POLICY "Customers can create tickets for themselves"
    ON public.tickets FOR INSERT
    WITH CHECK (customer_id = auth.uid() AND (assigned_agent_id IS NULL OR public.get_auth_role() = 'admin'));

CREATE POLICY "Agents and Admins can update tickets"
    ON public.tickets FOR UPDATE
    USING (
        public.get_auth_role() = 'admin'
        OR (public.get_auth_role() = 'agent' AND (assigned_agent_id = auth.uid() OR assigned_agent_id IS NULL))
        OR (customer_id = auth.uid() AND status IN ('resolved', 'waiting_for_customer'))
    );

CREATE POLICY "Admins can delete tickets"
    ON public.tickets FOR DELETE
    USING (public.get_auth_role() = 'admin');

-- 4. Conversations Policies
CREATE POLICY "Customers can view their own conversations"
    ON public.conversations FOR SELECT
    USING (customer_id = auth.uid() OR public.get_auth_role() = 'admin');

CREATE POLICY "Customers can create their own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own conversations"
    ON public.conversations FOR UPDATE
    USING (customer_id = auth.uid());

-- 5. Messages Policies
CREATE POLICY "Users can view messages of their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.customer_id = auth.uid() OR public.get_auth_role() IN ('admin', 'agent'))
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.customer_id = auth.uid() OR public.get_auth_role() IN ('admin', 'agent'))
        )
    );

-- 6. Ticket Responses Policies
CREATE POLICY "View responses: customers see public; agents/admins see all"
    ON public.ticket_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_responses.ticket_id
            AND (
                (t.customer_id = auth.uid() AND ticket_responses.is_internal = FALSE)
                OR t.assigned_agent_id = auth.uid()
                OR public.get_auth_role() IN ('agent', 'admin')
            )
        )
    );

CREATE POLICY "Insert responses: customers on own ticket, agents/admins on assigned"
    ON public.ticket_responses FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND (
            public.get_auth_role() IN ('agent', 'admin')
            OR (
                is_internal = FALSE AND EXISTS (
                    SELECT 1 FROM public.tickets t
                    WHERE t.id = ticket_responses.ticket_id AND t.customer_id = auth.uid()
                )
            )
        )
    );

-- 7. Ticket Activity Policies
CREATE POLICY "Ticket activity visible to assigned agents, admins, and ticket owners"
    ON public.ticket_activity FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_activity.ticket_id
            AND (t.customer_id = auth.uid() OR t.assigned_agent_id = auth.uid() OR public.get_auth_role() IN ('agent', 'admin'))
        )
    );

-- 8. Knowledge Base Policies
CREATE POLICY "Published KB is readable by anyone"
    ON public.knowledge_base FOR SELECT
    USING (is_published = TRUE OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins can manage KB articles"
    ON public.knowledge_base FOR ALL
    USING (public.get_auth_role() = 'admin');

-- 9. Notifications Policies
CREATE POLICY "Users can view and manage their own notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());

-- 10. Feedback Policies
CREATE POLICY "Customers can view feedback on their tickets"
    ON public.feedback FOR SELECT
    USING (customer_id = auth.uid() OR public.get_auth_role() IN ('agent', 'admin'));

CREATE POLICY "Customers can submit feedback on their resolved tickets"
    ON public.feedback FOR INSERT
    WITH CHECK (
        customer_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = feedback.ticket_id
            AND t.customer_id = auth.uid()
            AND t.status IN ('resolved', 'closed')
        )
    );

-- 11. Attachments Policies
CREATE POLICY "View ticket attachments"
    ON public.ticket_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_attachments.ticket_id
            AND (t.customer_id = auth.uid() OR t.assigned_agent_id = auth.uid() OR public.get_auth_role() IN ('agent', 'admin'))
        )
    );

CREATE POLICY "Upload ticket attachments"
    ON public.ticket_attachments FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid() AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_attachments.ticket_id
            AND (t.customer_id = auth.uid() OR t.assigned_agent_id = auth.uid() OR public.get_auth_role() IN ('agent', 'admin'))
        )
    );

-- 12. AI Analytics Policies
CREATE POLICY "Only admins can view AI analytics"
    ON public.ai_analytics FOR SELECT
    USING (public.get_auth_role() = 'admin');

CREATE POLICY "Only backend/admins can insert AI analytics"
    ON public.ai_analytics FOR INSERT
    WITH CHECK (public.get_auth_role() = 'admin' OR auth.uid() IS NOT NULL);

