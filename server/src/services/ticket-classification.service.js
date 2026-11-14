import { callGemini } from './gemini.service.js';
import { buildClassificationPrompt } from '../prompts/classification.prompt.js';
import { aiClassificationResponseSchema } from '../schemas/ai-output.schema.js';
import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore } from './store.service.js';

export const classifyTicket = async (subject, description) => {
  let categories = [];
  if (isLiveConfigured && supabase) {
    const { data } = await supabase.from('ticket_categories').select('*').eq('is_active', true);
    categories = data || [];
  } else {
    categories = localStore.ticket_categories.filter((c) => c.is_active);
  }

  const prompt = buildClassificationPrompt({
    subject,
    description,
    availableCategories: categories
  });

  const geminiResult = await callGemini({
    prompt,
    schema: aiClassificationResponseSchema
  });

  if (geminiResult) {
    // Map category name to valid category_id if present
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === geminiResult.category.toLowerCase()
    );
    return {
      ...geminiResult,
      category_id: matchedCategory ? matchedCategory.id : categories[0]?.id || null
    };
  }

  // Resilient heuristic fallback
  const text = `${subject} ${description}`.toLowerCase();
  let categoryName = 'General Inquiry';
  let intent = 'general_inquiry';
  let priority = 'medium';
  let sentiment = 'neutral';

  if (text.includes('refund') || text.includes('money back') || text.includes('cancel subscription')) {
    categoryName = 'Refunds & Returns';
    intent = 'refund_request';
    priority = 'medium';
  } else if (text.includes('bill') || text.includes('charge') || text.includes('invoice') || text.includes('payment') || text.includes('card')) {
    categoryName = 'Billing & Payments';
    intent = 'billing_inquiry';
    priority = text.includes('double') || text.includes('unauthorized') ? 'high' : 'medium';
  } else if (text.includes('error') || text.includes('timeout') || text.includes('bug') || text.includes('crash') || text.includes('504') || text.includes('api')) {
    categoryName = 'Technical Support';
    intent = 'technical_issue';
    priority = text.includes('outage') || text.includes('down') ? 'urgent' : 'high';
  } else if (text.includes('login') || text.includes('password') || text.includes('2fa') || text.includes('account')) {
    categoryName = 'Account Management';
    intent = 'account_issue';
    priority = 'medium';
  } else if (text.includes('order') || text.includes('shipping') || text.includes('tracking') || text.includes('delivery')) {
    categoryName = 'Orders & Delivery';
    intent = 'order_tracking';
    priority = 'medium';
  }

  if (text.includes('urgent') || text.includes('immediately') || text.includes('asap') || text.includes('broken')) {
    priority = 'urgent';
    sentiment = 'negative';
  }

  const matchedCat = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()) || categories[0];

  return {
    category: matchedCat ? matchedCat.name : categoryName,
    category_id: matchedCat ? matchedCat.id : null,
    priority,
    sentiment,
    intent,
    summary: subject.length > 20 ? subject : `${subject}: ${description.slice(0, 80)}...`,
    recommended_action: `Assign to ${categoryName} specialist for investigation`,
    confidence: 0.90
  };
};

