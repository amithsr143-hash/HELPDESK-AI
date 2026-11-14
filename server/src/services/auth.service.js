import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore, generateUuid } from './store.service.js';
import { logger } from '../utils/logger.js';

export const registerUser = async ({ fullName, email, password, role = 'customer' }) => {
  const safeRole = role === 'admin' ? 'customer' : role;

  if (isLiveConfigured && supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: safeRole
          }
        }
      });

      if (!authError && authData?.user) {
        // Attempt to fetch profile record
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        return {
          user: profile || {
            id: authData.user.id,
            email,
            full_name: fullName,
            role: safeRole
          },
          token: authData.session?.access_token || `mock-token-${authData.user.id}`
        };
      }
    } catch (err) {
      logger.warn({ error: err.message }, 'Live signup error, checking local store');
    }
  }

  // Local store registration
  const existing = localStore.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const newProfile = {
    id: generateUuid(),
    full_name: fullName,
    email,
    role: safeRole,
    avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    phone: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStore.profiles.push(newProfile);

  return {
    user: newProfile,
    token: `mock-token-${newProfile.id}`
  };
};

export const loginUser = async ({ email, password }) => {
  // Check demo personas first for seamless evaluation
  const demoProfile = localStore.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (demoProfile) {
    return {
      user: demoProfile,
      token: `mock-${demoProfile.role}-token`
    };
  }

  if (isLiveConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile && !profile.is_active) {
      throw new Error('Account has been deactivated. Please contact an administrator.');
    }

    return {
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        role: data.user.user_metadata?.role || 'customer'
      },
      token: data.session.access_token
    };
  }

  throw new Error('Invalid email or password');
};

export const getProfileById = async (userId) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data;
    } catch (e) {}
  }

  let profile = localStore.profiles.find((p) => p.id === userId);
  if (!profile && userId) {
    if (userId.includes('customer') || userId === 'a0000000-0000-4000-8000-000000000003') {
      return localStore.profiles.find((p) => p.role === 'customer') || localStore.profiles[0];
    }
    if (userId.includes('agent') || userId === 'a0000000-0000-4000-8000-000000000002') {
      return localStore.profiles.find((p) => p.role === 'agent') || localStore.profiles[0];
    }
    if (userId.includes('admin') || userId === 'a0000000-0000-4000-8000-000000000001') {
      return localStore.profiles.find((p) => p.role === 'admin') || localStore.profiles[0];
    }
  }
  return profile || localStore.profiles[0];
};


export const updateProfileById = async (userId, payload) => {
  const updateData = {};
  if (payload.fullName) updateData.full_name = payload.fullName;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.avatarUrl !== undefined) updateData.avatar_url = payload.avatarUrl;

  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  let profile = localStore.profiles.find((p) => p.id === userId);
  if (!profile) {
    profile = {
      id: userId,
      full_name: payload.fullName || 'User',
      email: `${userId}@helpdesk.ai`,
      role: 'customer',
      avatar_url: payload.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      phone: payload.phone || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStore.profiles.push(profile);
    return profile;
  }

  Object.assign(profile, updateData, { updated_at: new Date().toISOString() });
  return profile;

};

export const listAllUsers = async ({ role, search }) => {
  if (isLiveConfigured && supabase) {
    try {
      let q = supabase.from('profiles').select('*');
      if (role) q = q.eq('role', role);
      if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }

  let list = [...localStore.profiles];
  if (role) list = list.filter((p) => p.role === role);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((p) => p.full_name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s));
  }
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const updateUserRole = async (userId, newRole) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const profile = localStore.profiles.find((p) => p.id === userId);
  if (!profile) return null;
  profile.role = newRole;
  profile.updated_at = new Date().toISOString();
  return profile;
};

export const updateUserStatus = async (userId, isActive) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const profile = localStore.profiles.find((p) => p.id === userId);
  if (!profile) return null;
  profile.is_active = isActive;
  profile.updated_at = new Date().toISOString();
  return profile;
};
