import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore, generateUuid } from './store.service.js';
import { classifyTicket } from './ticket-classification.service.js';
import { createNotification } from './notification.service.js';
import { logger } from '../utils/logger.js';

export const createTicket = async (payload, customerId) => {
  // 1. Run AI classification on subject and description
  const aiClassification = await classifyTicket(payload.subject, payload.description);

  // 2. Select priority: user choice or AI suggestion
  const priority = payload.priority || aiClassification.priority || 'medium';
  const categoryId = payload.category_id || aiClassification.category_id;

  // 3. Auto-assign to an agent if available (round-robin / lowest load)
  let assignedAgentId = null;
  const agents = localStore.profiles.filter((p) => p.role === 'agent' && p.is_active);
  if (agents.length > 0) {
    const agentLoads = agents.map((agent) => {
      const count = localStore.tickets.filter(
        (t) => t.assigned_agent_id === agent.id && !['resolved', 'closed'].includes(t.status)
      ).length;
      return { agent, count };
    });
    agentLoads.sort((a, b) => a.count - b.count);
    assignedAgentId = agentLoads[0].agent.id;
  }

  const initialStatus = assignedAgentId ? 'assigned' : 'open';

  if (isLiveConfigured && supabase) {
    try {
      const { data: dbAgents } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'agent')
        .eq('is_active', true)
        .limit(1);
      if (dbAgents && dbAgents.length > 0) {
        assignedAgentId = dbAgents[0].id;
      }

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          customer_id: customerId,
          assigned_agent_id: assignedAgentId,
          category_id: categoryId,
          subject: payload.subject,
          description: payload.description,
          ai_summary: aiClassification.summary,
          ai_sentiment: aiClassification.sentiment,
          ai_suggested_priority: aiClassification.priority,
          priority,
          status: assignedAgentId ? 'assigned' : 'open'
        })
        .select('*, ticket_categories(name)')
        .single();

      if (!error && ticket) {
        return ticket;
      }
    } catch (e) {
      logger.warn({ error: e.message }, 'Live ticket insertion failed, using store');
    }
  }

  // Local store
  const ticketNumber = ++localStore.ticketCounter;
  const newTicket = {
    id: generateUuid(),
    ticket_number: ticketNumber,
    customer_id: customerId,
    assigned_agent_id: assignedAgentId,
    category_id: categoryId,
    subject: payload.subject,
    description: payload.description,
    ai_summary: aiClassification.summary,
    ai_sentiment: aiClassification.sentiment,
    ai_suggested_priority: aiClassification.priority,
    priority,
    status: initialStatus,
    resolution_notes: null,
    resolved_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStore.tickets.unshift(newTicket);

  // Activity log
  localStore.ticket_activity.unshift({
    id: generateUuid(),
    ticket_id: newTicket.id,
    actor_id: customerId,
    activity_type: 'ticket_created',
    old_value: null,
    new_value: { subject: newTicket.subject, priority: newTicket.priority, status: newTicket.status },
    created_at: new Date().toISOString()
  });

  // Notification for customer
  createNotification({
    userId: customerId,
    title: `Ticket Created: #${newTicket.ticket_number}`,
    message: `Your ticket "${newTicket.subject}" has been submitted and is currently ${newTicket.status}.`,
    notificationType: 'ticket_created',
    ticketId: newTicket.id
  });

  // Notification for agent if assigned
  if (assignedAgentId) {
    createNotification({
      userId: assignedAgentId,
      title: `New Ticket Assigned: #${newTicket.ticket_number}`,
      message: `You have been assigned to handle ticket #${newTicket.ticket_number}: ${newTicket.subject}`,
      notificationType: 'ticket_assigned',
      ticketId: newTicket.id
    });
  }

  const category = localStore.ticket_categories.find((c) => c.id === newTicket.category_id);
  const customer = localStore.profiles.find((p) => p.id === newTicket.customer_id);
  const agent = localStore.profiles.find((p) => p.id === newTicket.assigned_agent_id);

  return {
    ...newTicket,
    category_name: category ? category.name : null,
    customer_name: customer ? customer.full_name : null,
    customer_email: customer ? customer.email : null,
    agent_name: agent ? agent.full_name : 'Unassigned'
  };
};

export const getTickets = async ({ user, status, priority, categoryId, search, page = 1, limit = 20 }) => {
  if (isLiveConfigured && supabase) {
    try {
      let q = supabase
        .from('tickets')
        .select('*, ticket_categories(name), customer:profiles!customer_id(full_name, email), agent:profiles!assigned_agent_id(full_name, email)', { count: 'exact' });

      if (user.role === 'customer') {
        q = q.eq('customer_id', user.id);
      } else if (user.role === 'agent') {
        q = q.or(`assigned_agent_id.eq.${user.id},assigned_agent_id.is.null`);
      }

      if (status) q = q.eq('status', status);
      if (priority) q = q.eq('priority', priority);
      if (categoryId) q = q.eq('category_id', categoryId);
      if (search) q = q.or(`subject.ilike.%${search}%,description.ilike.%${search}%`);

      const offset = (page - 1) * limit;
      const { data, count, error } = await q
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        return {
          tickets: data,
          total: count || data.length,
          page: Number(page),
          limit: Number(limit)
        };
      }
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live tickets query, fallback to local');
    }
  }

  // Local store
  let list = [...localStore.tickets];

  if (user.role === 'customer') {
    list = list.filter((t) => t.customer_id === user.id);
  } else if (user.role === 'agent') {
    list = list.filter((t) => t.assigned_agent_id === user.id || t.assigned_agent_id === null);
  }

  if (status) list = list.filter((t) => t.status === status);
  if (priority) list = list.filter((t) => t.priority === priority);
  if (categoryId) list = list.filter((t) => t.category_id === categoryId);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (t) =>
        t.subject.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        String(t.ticket_number).includes(s)
    );
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = list.length;
  const offset = (page - 1) * limit;
  const paged = list.slice(offset, offset + limit).map((t) => {
    const category = localStore.ticket_categories.find((c) => c.id === t.category_id);
    const customer = localStore.profiles.find((p) => p.id === t.customer_id);
    const agent = localStore.profiles.find((p) => p.id === t.assigned_agent_id);
    return {
      ...t,
      category_name: category ? category.name : null,
      customer_name: customer ? customer.full_name : null,
      customer_email: customer ? customer.email : null,
      agent_name: agent ? agent.full_name : 'Unassigned'
    };
  });

  return {
    tickets: paged,
    total,
    page: Number(page),
    limit: Number(limit)
  };
};

export const getTicketById = async (ticketId, user) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*, ticket_categories(name), customer:profiles!customer_id(full_name, email, phone), agent:profiles!assigned_agent_id(full_name, email)')
        .eq('id', ticketId)
        .single();

      if (!error && ticket) {
        if (user.role === 'customer' && ticket.customer_id !== user.id) {
          return null;
        }

        let responsesQuery = supabase
          .from('ticket_responses')
          .select('*, sender:profiles!sender_id(full_name, role, avatar_url)')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (user.role === 'customer') {
          responsesQuery = responsesQuery.eq('is_internal', false);
        }
        const { data: responses } = await responsesQuery;

        const { data: activity } = await supabase
          .from('ticket_activity')
          .select('*, actor:profiles!actor_id(full_name, role)')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: false });

        const { data: feedback } = await supabase
          .from('feedback')
          .select('*')
          .eq('ticket_id', ticketId)
          .single();

        return {
          ...ticket,
          responses: responses || [],
          activity: activity || [],
          feedback: feedback || null
        };
      }
    } catch (e) {}
  }

  // Local store
  const ticket = localStore.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  if (user.role === 'customer' && ticket.customer_id !== user.id) {
    return null;
  }

  const category = localStore.ticket_categories.find((c) => c.id === ticket.category_id);
  const customer = localStore.profiles.find((p) => p.id === ticket.customer_id);
  const agent = localStore.profiles.find((p) => p.id === ticket.assigned_agent_id);

  let responses = localStore.ticket_responses.filter((r) => r.ticket_id === ticket.id);
  if (user.role === 'customer') {
    responses = responses.filter((r) => !r.is_internal);
  }
  responses = responses.map((r) => {
    const sender = localStore.profiles.find((p) => p.id === r.sender_id);
    return {
      ...r,
      sender_name: sender ? sender.full_name : 'Unknown User',
      sender_role: sender ? sender.role : 'customer',
      sender_avatar: sender ? sender.avatar_url : null
    };
  }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const activity = localStore.ticket_activity
    .filter((a) => a.ticket_id === ticket.id)
    .map((a) => {
      const actor = localStore.profiles.find((p) => p.id === a.actor_id);
      return {
        ...a,
        actor_name: actor ? actor.full_name : 'System',
        actor_role: actor ? actor.role : 'system'
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const feedback = localStore.feedback.find((f) => f.ticket_id === ticket.id) || null;

  return {
    ...ticket,
    category_name: category ? category.name : null,
    customer_name: customer ? customer.full_name : null,
    customer_email: customer ? customer.email : null,
    customer_phone: customer ? customer.phone : null,
    agent_name: agent ? agent.full_name : 'Unassigned',
    responses,
    activity,
    feedback
  };
};

export const updateTicketStatus = async (ticketId, status, resolutionNotes, actor) => {
  if (isLiveConfigured && supabase) {
    try {
      const updatePayload = {
        status,
        updated_at: new Date().toISOString()
      };
      if (resolutionNotes) updatePayload.resolution_notes = resolutionNotes;
      if (status === 'resolved') updatePayload.resolved_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('tickets')
        .update(updatePayload)
        .eq('id', ticketId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const ticket = localStore.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const oldStatus = ticket.status;
  ticket.status = status;
  ticket.updated_at = new Date().toISOString();

  if (resolutionNotes) {
    ticket.resolution_notes = resolutionNotes;
  }
  if (status === 'resolved') {
    ticket.resolved_at = new Date().toISOString();
  }

  localStore.ticket_activity.unshift({
    id: generateUuid(),
    ticket_id: ticket.id,
    actor_id: actor.id,
    activity_type: 'status_changed',
    old_value: { status: oldStatus },
    new_value: { status: ticket.status },
    created_at: new Date().toISOString()
  });

  createNotification({
    userId: ticket.customer_id,
    title: `Ticket #${ticket.ticket_number} Status Updated`,
    message: `Your ticket status was changed from ${oldStatus} to ${status}.`,
    notificationType: 'status_changed',
    ticketId: ticket.id
  });

  return ticket;
};

export const assignAgent = async (ticketId, agentId, actor) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          assigned_agent_id: agentId,
          status: agentId ? 'assigned' : 'open',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const ticket = localStore.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const oldAgentId = ticket.assigned_agent_id;
  ticket.assigned_agent_id = agentId;
  ticket.status = agentId ? 'assigned' : 'open';
  ticket.updated_at = new Date().toISOString();

  localStore.ticket_activity.unshift({
    id: generateUuid(),
    ticket_id: ticket.id,
    actor_id: actor.id,
    activity_type: 'agent_assigned',
    old_value: { agent_id: oldAgentId },
    new_value: { agent_id: agentId },
    created_at: new Date().toISOString()
  });

  if (agentId) {
    createNotification({
      userId: agentId,
      title: `Assigned Ticket #${ticket.ticket_number}`,
      message: `You were assigned to ticket #${ticket.ticket_number}: ${ticket.subject}`,
      notificationType: 'ticket_assigned',
      ticketId: ticket.id
    });
  }

  createNotification({
    userId: ticket.customer_id,
    title: `Agent Assigned to Ticket #${ticket.ticket_number}`,
    message: `A support specialist has been assigned to your request.`,
    notificationType: 'agent_assigned',
    ticketId: ticket.id
  });

  return ticket;
};

export const addTicketResponse = async (ticketId, { message, is_internal = false, status_update }, sender) => {
  const safeInternal = sender.role === 'customer' ? false : Boolean(is_internal);

  let savedLive = false;
  if (isLiveConfigured && supabase) {
    try {
      const { data: response, error: respErr } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          sender_id: sender.id,
          message,
          is_internal: safeInternal
        })
        .select('*, sender:profiles!sender_id(full_name, role)')
        .single();

      if (!respErr && response) {
        savedLive = true;
        if (status_update) {
          await supabase
            .from('tickets')
            .update({ status: status_update, updated_at: new Date().toISOString() })
            .eq('id', ticketId);
        }
        return response;
      }
    } catch (e) {}
  }

  const ticket = localStore.tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const newResponse = {
    id: generateUuid(),
    ticket_id: ticketId,
    sender_id: sender.id,
    message,
    is_internal: safeInternal,
    created_at: new Date().toISOString()
  };

  localStore.ticket_responses.push(newResponse);

  if (status_update) {
    ticket.status = status_update;
    if (status_update === 'resolved') {
      ticket.resolved_at = new Date().toISOString();
    }
  }
  ticket.updated_at = new Date().toISOString();

  if (!safeInternal) {
    if (sender.id === ticket.customer_id && ticket.assigned_agent_id) {
      createNotification({
        userId: ticket.assigned_agent_id,
        title: `Customer Reply on #${ticket.ticket_number}`,
        message: `Customer added a response: "${message.slice(0, 60)}..."`,
        notificationType: 'customer_responded',
        ticketId: ticket.id
      });
    } else if (sender.id !== ticket.customer_id) {
      createNotification({
        userId: ticket.customer_id,
        title: `Support Reply on #${ticket.ticket_number}`,
        message: `Agent replied: "${message.slice(0, 60)}..."`,
        notificationType: 'agent_responded',
        ticketId: ticket.id
      });
    }
  }

  return {
    ...newResponse,
    sender_name: sender.full_name,
    sender_role: sender.role,
    sender_avatar: sender.avatar_url
  };
};

export const submitFeedback = async (ticketId, { rating, comment }, customerId) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          ticket_id: ticketId,
          customer_id: customerId,
          rating,
          comment: comment || null
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const ticket = localStore.tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  const existing = localStore.feedback.find((f) => f.ticket_id === ticketId);
  if (existing) {
    throw new Error('Feedback already submitted for this ticket');
  }

  const newFeedback = {
    id: generateUuid(),
    ticket_id: ticketId,
    customer_id: customerId,
    rating,
    comment: comment || null,
    created_at: new Date().toISOString()
  };

  localStore.feedback.push(newFeedback);
  return newFeedback;
};
