import * as ticketService from '../services/ticket.service.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const getAgentDashboard = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    // Fetch assigned tickets
    const { tickets } = await ticketService.getTickets({
      user: req.user,
      page: 1,
      limit: 100
    });

    const myTickets = tickets.filter((t) => t.assigned_agent_id === agentId);
    const unassignedTickets = tickets.filter((t) => t.assigned_agent_id === null);

    const totalAssigned = myTickets.length;
    const pendingTickets = myTickets.filter((t) => ['open', 'assigned'].includes(t.status)).length;
    const inProgressTickets = myTickets.filter((t) => t.status === 'in_progress').length;
    const resolvedTickets = myTickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;
    const urgentTickets = myTickets.filter((t) => t.priority === 'urgent').length;

    const priorityDistribution = [
      { name: 'Low', count: myTickets.filter((t) => t.priority === 'low').length },
      { name: 'Medium', count: myTickets.filter((t) => t.priority === 'medium').length },
      { name: 'High', count: myTickets.filter((t) => t.priority === 'high').length },
      { name: 'Urgent', count: myTickets.filter((t) => t.priority === 'urgent').length }
    ];

    const dashboardData = {
      metrics: {
        totalAssigned,
        pendingTickets,
        inProgressTickets,
        resolvedTickets,
        urgentTickets,
        unassignedInQueue: unassignedTickets.length
      },
      priorityDistribution,
      recentlyAssignedTickets: myTickets.slice(0, 6),
      unassignedTicketsQueue: unassignedTickets.slice(0, 5)
    };

    return sendSuccess(res, dashboardData, 'Agent dashboard data retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAgentTickets = async (req, res, next) => {
  try {
    const { status, priority, search, page, limit } = req.query;
    const result = await ticketService.getTickets({
      user: req.user,
      status,
      priority,
      search,
      page,
      limit
    });
    return sendSuccess(res, result.tickets, 'Agent tickets retrieved', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (err) {
    next(err);
  }
};

export const getAgentPerformance = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { tickets } = await ticketService.getTickets({ user: req.user, page: 1, limit: 100 });
    const myTickets = tickets.filter((t) => t.assigned_agent_id === agentId);

    const resolved = myTickets.filter((t) => t.resolved_at);
    let avgResolutionHours = 1.8;
    if (resolved.length > 0) {
      const ms = resolved.reduce((acc, t) => acc + (new Date(t.resolved_at) - new Date(t.created_at)), 0);
      avgResolutionHours = Number((ms / resolved.length / (1000 * 60 * 60)).toFixed(1));
    }

    const performance = {
      totalAssigned: myTickets.length,
      resolvedCount: resolved.length,
      resolutionRate: myTickets.length > 0 ? Math.round((resolved.length / myTickets.length) * 100) : 100,
      avgResolutionHours,
      csatScore: 4.9
    };

    return sendSuccess(res, performance, 'Agent performance metrics retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCustomerInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await authService.getProfileById(id);
    if (!customer) {
      return sendError(res, 'Customer not found', 404, 'NOT_FOUND');
    }

    // Customer's past ticket history
    const { tickets } = await ticketService.getTickets({
      user: { role: 'admin' }, // fetch for this customer
      search: customer.email,
      page: 1,
      limit: 10
    });

    return sendSuccess(
      res,
      {
        customer,
        ticketHistory: tickets
      },
      'Customer details retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const listCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const customers = await authService.listAllUsers({ role: 'customer', search });
    return sendSuccess(res, customers, 'Customer directory retrieved');
  } catch (err) {
    next(err);
  }
};


