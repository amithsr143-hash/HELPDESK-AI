-- 004_triggers.sql: Database Triggers & Automations for HELPDESK AI

-- 1. Generic function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;
CREATE TRIGGER set_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_kb_updated_at ON public.knowledge_base;
CREATE TRIGGER set_kb_updated_at
    BEFORE UPDATE ON public.knowledge_base
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Trigger to automatically create profile on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_name TEXT;
    assigned_role TEXT;
BEGIN
    raw_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    -- Enforce customer role for self-registration unless created with specific admin setup
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    IF assigned_role NOT IN ('customer', 'agent', 'admin') THEN
        assigned_role := 'customer';
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role, avatar_url, is_active)
    VALUES (
        NEW.id,
        raw_name,
        NEW.email,
        assigned_role,
        NEW.raw_user_meta_data->>'avatar_url',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Ticket Activity and Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_ticket_change()
RETURNS TRIGGER AS $$
DECLARE
    actor UUID;
BEGIN
    actor := auth.uid();

    -- On INSERT (Ticket created)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.ticket_activity (ticket_id, actor_id, activity_type, old_value, new_value)
        VALUES (
            NEW.id,
            actor,
            'ticket_created',
            NULL,
            jsonb_build_object('subject', NEW.subject, 'priority', NEW.priority, 'status', NEW.status)
        );

        -- Send initial notification to customer
        INSERT INTO public.notifications (user_id, title, message, notification_type, related_ticket_id)
        VALUES (
            NEW.customer_id,
            'Ticket Created: #' || NEW.ticket_number,
            'Your support request "' || NEW.subject || '" has been registered and is being reviewed.',
            'ticket_created',
            NEW.id
        );
        RETURN NEW;
    END IF;

    -- On UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Status change
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO public.ticket_activity (ticket_id, actor_id, activity_type, old_value, new_value)
            VALUES (
                NEW.id,
                actor,
                'status_changed',
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status)
            );

            -- Notify customer of status change
            INSERT INTO public.notifications (user_id, title, message, notification_type, related_ticket_id)
            VALUES (
                NEW.customer_id,
                'Ticket #' || NEW.ticket_number || ' Status Updated',
                'Your ticket status changed from ' || OLD.status || ' to ' || NEW.status || '.',
                'status_changed',
                NEW.id
            );

            -- If resolved, set resolved_at
            IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
                NEW.resolved_at := NOW();
            END IF;
        END IF;

        -- Agent assignment
        IF OLD.assigned_agent_id IS DISTINCT FROM NEW.assigned_agent_id THEN
            INSERT INTO public.ticket_activity (ticket_id, actor_id, activity_type, old_value, new_value)
            VALUES (
                NEW.id,
                actor,
                'agent_assigned',
                jsonb_build_object('agent_id', OLD.assigned_agent_id),
                jsonb_build_object('agent_id', NEW.assigned_agent_id)
            );

            -- Notify newly assigned agent if assigned
            IF NEW.assigned_agent_id IS NOT NULL THEN
                INSERT INTO public.notifications (user_id, title, message, notification_type, related_ticket_id)
                VALUES (
                    NEW.assigned_agent_id,
                    'New Ticket Assigned: #' || NEW.ticket_number,
                    'You have been assigned to handle ticket: ' || NEW.subject,
                    'ticket_assigned',
                    NEW.id
                );
            END IF;

            -- Notify customer
            INSERT INTO public.notifications (user_id, title, message, notification_type, related_ticket_id)
            VALUES (
                NEW.customer_id,
                'Agent Assigned: #' || NEW.ticket_number,
                'A support agent has been assigned to your ticket.',
                'agent_assigned',
                NEW.id
            );
        END IF;

        -- Priority change
        IF OLD.priority IS DISTINCT FROM NEW.priority THEN
            INSERT INTO public.ticket_activity (ticket_id, actor_id, activity_type, old_value, new_value)
            VALUES (
                NEW.id,
                actor,
                'priority_changed',
                jsonb_build_object('priority', OLD.priority),
                jsonb_build_object('priority', NEW.priority)
            );
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_ticket_lifecycle ON public.tickets;
CREATE TRIGGER trg_ticket_lifecycle
    AFTER INSERT OR UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.handle_ticket_change();

-- 4. Notification on new Ticket Response
CREATE OR REPLACE FUNCTION public.handle_ticket_response_notification()
RETURNS TRIGGER AS $$
DECLARE
    ticket_rec RECORD;
BEGIN
    SELECT * INTO ticket_rec FROM public.tickets WHERE id = NEW.ticket_id;

    -- If sender is not customer, notify customer (unless it's an internal note)
    IF NEW.is_internal = FALSE AND NEW.sender_id != ticket_rec.customer_id THEN
        INSERT INTO public.notifications (user_id, title, message, notification_type, related_ticket_id)
        VALUES (
            ticket_rec.customer_id,
            'New Response on Ticket #' || ticket_rec.ticket_number,
            'A support representative replied to your ticket.',
            'agent_responded',
            NEW.ticket_id
        );
    -- If sender is customer, notify assigned agent if any
    ELSIF NEW.sender_id = ticket_rec.customer_id AND ticket_rec.assigned_agent_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, notification_type, related_ticket_id)
        VALUES (
            ticket_rec.assigned_agent_id,
            'Customer Replied on Ticket #' || ticket_rec.ticket_number,
            'The customer added a new reply.',
            'customer_responded',
            NEW.ticket_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_ticket_response_notify ON public.ticket_responses;
CREATE TRIGGER trg_ticket_response_notify
    AFTER INSERT ON public.ticket_responses
    FOR EACH ROW EXECUTE FUNCTION public.handle_ticket_response_notification();

