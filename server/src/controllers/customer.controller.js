import * as ticketService from '../services/ticket.service.js';
import * as chatService from '../services/chat.service.js';
import * as notificationService from '../services/notification.service.js';
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const getCustomerDashboard = async (req, res, next) => {
  try {
    const customerId = req.user.id;

    // Fetch own tickets
    const { tickets } = await ticketService.getTickets({
      user: req.user,
      page: 1,
      limit: 50
    });

    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === 'open').length;
    const inProgressTickets = tickets.filter((t) => ['assigned', 'in_progress', 'waiting_for_customer'].includes(t.status)).length;
    const resolvedTickets = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;

    // Fetch recent conversations
    const conversations = await chatService.getCustomerConversations(customerId);

    // Fetch unread notifications
    const notifications = await notificationService.getUserNotifications(customerId);

    const dashboardData = {
      user: req.user,
      metrics: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets
      },
      recentTickets: tickets.slice(0, 5),
      recentConversations: conversations.slice(0, 3),
      unreadNotificationsCount: notifications.filter((n) => !n.is_read).length,
      recentNotifications: notifications.slice(0, 5)
    };

    return sendSuccess(res, dashboardData, 'Customer dashboard data retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfileById(req.user.id);
    return sendSuccess(res, profile, 'Customer profile retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateCustomerProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfileById(req.user.id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const getCustomerTickets = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await ticketService.getTickets({
      user: req.user,
      status,
      search,
      page,
      limit
    });
    return sendSuccess(res, result.tickets, 'Customer tickets retrieved', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (err) {
    next(err);
  }
};

