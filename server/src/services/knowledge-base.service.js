import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore, generateUuid } from './store.service.js';
import { logger } from '../utils/logger.js';

const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could',
  'do', 'does', 'for', 'from', 'get', 'has', 'have', 'how', 'i', 'in', 'is',
  'it', 'its', 'my', 'me', 'of', 'on', 'or', 'our', 'please', 'tell', 'that',
  'the', 'this', 'to', 'us', 'was', 'we', 'what', 'when', 'where', 'which',
  'who', 'why', 'will', 'with', 'would', 'you', 'your'
]);

export const extractKeywords = (text) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return Array.from(new Set(words));
};

const calculateArticleScore = (article, tokens) => {
  if (!tokens || tokens.length === 0) return 0;
  let score = 0;
  const titleLower = (article.title || '').toLowerCase();
  const qLower = (article.question || '').toLowerCase();
  const aLower = (article.answer || '').toLowerCase();
  const keywordsLower = (article.keywords || []).map((k) => k.toLowerCase());

  for (const token of tokens) {
    if (keywordsLower.some((k) => k.includes(token) || token.includes(k))) {
      score += 6;
    }
    if (titleLower.includes(token)) {
      score += 4;
    }
    if (qLower.includes(token)) {
      score += 3;
    }
    if (aLower.includes(token)) {
      score += 1;
    }
  }
  return score;
};

export const getPublishedArticles = async (query = '', categoryId = null) => {
  const tokens = extractKeywords(query);

  if (isLiveConfigured && supabase) {
    try {
      let q = supabase
        .from('knowledge_base')
        .select('*, ticket_categories(name)')
        .eq('is_published', true);

      if (categoryId) {
        q = q.eq('category_id', categoryId);
      }

      if (tokens.length > 0) {
        const orConditions = tokens
          .slice(0, 5)
          .map((t) => `title.ilike.%${t}%,question.ilike.%${t}%,answer.ilike.%${t}%`)
          .join(',');
        q = q.or(orConditions);
      }

      const { data, error } = await q.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        if (tokens.length > 0) {
          const scored = data
            .map((item) => ({ ...item, _score: calculateArticleScore(item, tokens) }))
            .filter((item) => item._score > 0)
            .sort((a, b) => b._score - a._score);
          if (scored.length > 0) {
            return scored;
          }
        } else {
          return data;
        }
      }
    } catch (err) {
      logger.warn({ error: err.message }, 'Failed to query live KB, using fallback seed');
    }
  }

  // Local / seed store fallback
  let articles = localStore.knowledge_base.filter((a) => a.is_published);

  if (categoryId) {
    articles = articles.filter((a) => a.category_id === categoryId);
  }

  if (tokens.length > 0) {
    const scored = articles
      .map((a) => ({ ...a, _score: calculateArticleScore(a, tokens) }))
      .filter((a) => a._score > 0)
      .sort((a, b) => b._score - a._score);
    if (scored.length > 0) {
      articles = scored;
    }
  } else if (query && query.trim().length > 0) {
    const qLower = query.toLowerCase().trim();
    articles = articles.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(qLower)) ||
        (a.question && a.question.toLowerCase().includes(qLower)) ||
        (a.answer && a.answer.toLowerCase().includes(qLower))
    );
  }

  return articles.map((a) => {
    const cat = localStore.ticket_categories.find((c) => c.id === a.category_id);
    return { ...a, category_name: cat ? cat.name : (a.category_name || 'General Support') };
  });

};

export const getAllArticlesAdmin = async (query = '', categoryId = null) => {
  const tokens = extractKeywords(query);

  if (isLiveConfigured && supabase) {
    try {
      let q = supabase
        .from('knowledge_base')
        .select('*, ticket_categories(name)');

      if (categoryId) q = q.eq('category_id', categoryId);
      if (tokens.length > 0) {
        const orConditions = tokens
          .slice(0, 5)
          .map((t) => `title.ilike.%${t}%,question.ilike.%${t}%`)
          .join(',');
        q = q.or(orConditions);
      }

      const { data, error } = await q.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      logger.warn({ error: err.message }, 'Live KB query failed, falling back to local');
    }
  }

  let articles = [...localStore.knowledge_base];
  if (categoryId) articles = articles.filter((a) => a.category_id === categoryId);
  if (tokens.length > 0) {
    articles = articles
      .map((a) => ({ ...a, _score: calculateArticleScore(a, tokens) }))
      .filter((a) => a._score > 0)
      .sort((a, b) => b._score - a._score);
  } else if (query && query.trim().length > 0) {
    const qLower = query.toLowerCase();
    articles = articles.filter(
      (a) => a.title.toLowerCase().includes(qLower) || a.question.toLowerCase().includes(qLower)
    );
  }
  return articles.map((a) => {
    const cat = localStore.ticket_categories.find((c) => c.id === a.category_id);
    return { ...a, category_name: cat ? cat.name : null };
  });
};

export const getArticleById = async (id) => {
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*, ticket_categories(name)')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const article = localStore.knowledge_base.find((a) => a.id === id);
  if (!article) return null;
  const cat = localStore.ticket_categories.find((c) => c.id === article.category_id);
  return { ...article, category_name: cat ? cat.name : null };
};

export const createArticle = async (payload, authorId) => {
  const newArticle = {
    title: payload.title,
    question: payload.question,
    answer: payload.answer,
    category_id: payload.category_id || null,
    keywords: payload.keywords || [],
    is_published: payload.is_published ?? true,
    created_by: authorId
  };

  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert(newArticle)
        .select('*, ticket_categories(name)')
        .single();
      if (!error && data) return data;
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live create KB article, using local store');
    }
  }

  const created = {
    ...newArticle,
    id: generateUuid(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  localStore.knowledge_base.unshift(created);
  const cat = localStore.ticket_categories.find((c) => c.id === created.category_id);
  return { ...created, category_name: cat ? cat.name : null };
};

export const updateArticle = async (id, payload) => {
  const updates = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .update(updates)
        .eq('id', id)
        .select('*, ticket_categories(name)')
        .single();
      if (!error && data) return data;
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live update KB article, using local store');
    }
  }

  const idx = localStore.knowledge_base.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  localStore.knowledge_base[idx] = { ...localStore.knowledge_base[idx], ...updates };
  const cat = localStore.ticket_categories.find((c) => c.id === localStore.knowledge_base[idx].category_id);
  return { ...localStore.knowledge_base[idx], category_name: cat ? cat.name : null };
};

export const deleteArticle = async (id) => {
  if (isLiveConfigured && supabase) {
    try {
      await supabase.from('knowledge_base').delete().eq('id', id);
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live delete KB article, using local store');
    }
  }

  const initialLen = localStore.knowledge_base.length;
  localStore.knowledge_base = localStore.knowledge_base.filter((a) => a.id !== id);
  return localStore.knowledge_base.length < initialLen;
};
