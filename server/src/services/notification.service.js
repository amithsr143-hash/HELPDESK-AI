import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore, generateUuid } from './store.service.js';

export const getUserNotifications = async (userId) => {
  if (isLiveConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  return localStore.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const markNotificationRead = async (notificationId, userId) => {
  if (isLiveConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const notif = localStore.notifications.find((n) => n.id === notificationId && n.user_id === userId);
  if (notif) {
    notif.is_read = true;
  }
  return notif;
};

export const markAllNotificationsRead = async (userId) => {
  if (isLiveConfigured && supabase) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  localStore.notifications.forEach((n) => {
    if (n.user_id === userId) {
      n.is_read = true;
    }
  });
  return true;
};

export const createNotification = async ({ userId, title, message, notificationType, ticketId = null }) => {
  const notif = {
    user_id: userId,
    title,
    message,
    notification_type: notificationType,
    related_ticket_id: ticketId,
    is_read: false
  };

  if (isLiveConfigured && supabase) {
    const { data } = await supabase.from('notifications').insert(notif).select().single();
    return data;
  }

  const created = {
    id: generateUuid(),
    ...notif,
    created_at: new Date().toISOString()
  };
  localStore.notifications.unshift(created);
  return created;
};

