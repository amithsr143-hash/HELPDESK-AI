import * as notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await notificationService.markNotificationRead(id, req.user.id);
    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllNotificationsRead(req.user.id);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

