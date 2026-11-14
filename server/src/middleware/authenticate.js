import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore } from '../services/store.service.js';
import { sendError } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token missing or malformed', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    // 1. Support demo evaluation tokens seamlessly (for testing and quick role switching)
    if (
      token === 'mock-admin-token' ||
      token === 'mock-agent-token' ||
      token === 'mock-customer-token' ||
      token.startsWith('mock-')
    ) {
      let targetRole = 'customer';
      if (token.includes('admin')) targetRole = 'admin';
      else if (token.includes('agent')) targetRole = 'agent';

      const matched = localStore.profiles.find((p) => token.includes(p.id) || p.role === targetRole);
      const demoUser = matched || {
        id: `mock-${targetRole}-id`,
        email: `${targetRole}@helpdesk.ai`,
        full_name: `${targetRole.toUpperCase()} User`,
        role: targetRole,
        avatar_url: null,
        is_active: true
      };
      req.user = demoUser;
      return next();
    }


    // 2. Live Supabase JWT verification
    if (isLiveConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        logger.warn({ error: error?.message }, 'Supabase JWT verification failed');
        return sendError(res, 'Invalid or expired session token', 401, 'UNAUTHORIZED');
      }

      // Fetch profile role from database
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr || !profile) {
        // If profile row not yet created by trigger, use auth user metadata
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'customer',
          avatar_url: user.user_metadata?.avatar_url || null
        };
        return next();
      }

      if (!profile.is_active) {
        return sendError(res, 'Account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
      }

      req.user = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url
      };
      return next();
    } else {
      // Local development token matching
      const matchedProfile = localStore.profiles.find(
        (p) => p.id === token || p.email === token || token.includes(p.role)
      ) || localStore.profiles[0];

      if (!matchedProfile.is_active) {
        return sendError(res, 'Account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
      }

      req.user = {
        id: matchedProfile.id,
        email: matchedProfile.email,
        full_name: matchedProfile.full_name,
        role: matchedProfile.role,
        avatar_url: matchedProfile.avatar_url
      };
      return next();
    }
  } catch (err) {
    logger.error({ error: err.message }, 'Unexpected authentication error');
    return sendError(res, 'Authentication error', 500, 'AUTH_ERROR');
  }
};
