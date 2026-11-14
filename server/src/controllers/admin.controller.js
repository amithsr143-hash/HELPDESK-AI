import * as authService from '../services/auth.service.js';
import * as ticketService from '../services/ticket.service.js';
import * as analyticsService from '../services/analytics.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getAggregatedMetrics();
    const { tickets: recentTickets } = await ticketService.getTickets({
      user: req.user,
      page: 1,
      limit: 6
    });

    return sendSuccess(
      res,
      {
        metrics,
        recentTickets
      },
      'Admin dashboard data retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const users = await authService.listAllUsers({ role, search });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await authService.updateUserRole(id, role);
    if (!updated) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updated, `User role changed to ${role}`);
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = await authService.updateUserStatus(id, isActive);
    if (!updated) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updated, `User ${isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

export const listAgents = async (req, res, next) => {
  try {
    const agents = await authService.listAllUsers({ role: 'agent' });
    return sendSuccess(res, agents, 'Agents retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createAgent = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const result = await authService.registerUser({
      fullName,
      email,
      password: password || 'AgentSecret123!',
      role: 'agent'
    });
    return sendSuccess(res, result.user, 'Agent account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getAIAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getAIAnalytics();
    return sendSuccess(res, analytics, 'AI-powered support analytics retrieved');
  } catch (err) {
    next(err);
  }
};

