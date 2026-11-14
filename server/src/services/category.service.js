import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore, generateUuid } from './store.service.js';
import { logger } from '../utils/logger.js';

export const listCategories = async ({ includeInactive = false } = {}) => {
  if (isLiveConfigured && supabase) {
    try {
      let q = supabase
        .from('ticket_categories')
        .select('*')
        .order('name', { ascending: true });

      if (!includeInactive) {
        q = q.eq('is_active', true);
      }

      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return data;
      }
      if (!error && data && data.length === 0) {
        // Automatically seed default categories to live Supabase
        const toSeed = localStore.ticket_categories.map((c) => ({
          name: c.name,
          description: c.description,
          is_active: c.is_active
        }));
        const { data: seeded } = await supabase.from('ticket_categories').insert(toSeed).select();
        if (seeded && seeded.length > 0) {
          return seeded;
        }
      }
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed to fetch categories from Supabase, using localStore fallback');
    }
  }

  let categories = [...localStore.ticket_categories];
  if (!includeInactive) {
    categories = categories.filter((c) => c.is_active);
  }
  return categories.sort((a, b) => a.name.localeCompare(b.name));
};

export const createCategory = async ({ name, description = '', is_active = true }) => {
  const newCat = {
    name,
    description,
    is_active: is_active ?? true
  };

  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .insert(newCat)
        .select()
        .single();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live create category, using localStore');
    }
  }

  const created = {
    id: generateUuid(),
    ...newCat,
    created_at: new Date().toISOString()
  };
  localStore.ticket_categories.push(created);
  return created;
};

export const updateCategory = async (id, { name, description, is_active }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (is_active !== undefined) updates.is_active = is_active;

  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live update category, using localStore');
    }
  }

  const idx = localStore.ticket_categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  localStore.ticket_categories[idx] = {
    ...localStore.ticket_categories[idx],
    ...updates
  };
  return localStore.ticket_categories[idx];
};

export const deleteCategory = async (id) => {
  if (isLiveConfigured && supabase) {
    try {
      const { error } = await supabase.from('ticket_categories').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live delete category, using localStore');
    }
  }

  const idx = localStore.ticket_categories.findIndex((c) => c.id === id);
  if (idx !== -1) {
    localStore.ticket_categories.splice(idx, 1);
    return true;
  }
  return false;
};
