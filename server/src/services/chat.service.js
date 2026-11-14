import { supabase, isLiveConfigured } from '../config/supabase.js';
import { localStore, generateUuid } from './store.service.js';
import { callGemini } from './gemini.service.js';
import { buildChatPrompt } from '../prompts/chat.prompt.js';
import { aiChatResponseSchema } from '../schemas/ai-output.schema.js';
import { getPublishedArticles } from './knowledge-base.service.js';
import { logger } from '../utils/logger.js';

export const processChatMessage = async ({ customerId, conversationId, messageText }) => {
  // 1. Get or create conversation
  let currentConversationId = conversationId;

  if (isLiveConfigured && supabase) {
    try {
      if (!currentConversationId) {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert({
            customer_id: customerId,
            title: messageText.slice(0, 45) + (messageText.length > 45 ? '...' : '')
          })
          .select()
          .single();
        if (!convErr && newConv) {
          currentConversationId = newConv.id;
        } else if (convErr) {
          logger.warn({ error: convErr.message }, 'Failed live conversation insertion, fallback to localStore');
        }
      } else {
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
      }
    } catch (e) {
      logger.warn({ error: e.message }, 'Failed live conversation creation, fallback to local');
    }
  }

  if (!currentConversationId) {
    const newConv = {
      id: generateUuid(),
      customer_id: customerId,
      title: messageText.slice(0, 45) + (messageText.length > 45 ? '...' : ''),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStore.conversations.unshift(newConv);
    currentConversationId = newConv.id;
  } else {
    const existingLocal = localStore.conversations.find((c) => c.id === currentConversationId);
    if (existingLocal) {
      existingLocal.updated_at = new Date().toISOString();
    }
  }

  // 2. Retrieve history (last 10 messages)
  let history = [];
  if (isLiveConfigured && supabase) {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true })
        .limit(10);
      history = messages || [];
    } catch (err) {}
  }

  if (history.length === 0) {
    history = localStore.messages
      .filter((m) => m.conversation_id === currentConversationId)
      .slice(-10);
  }

  // 3. Check for pure greetings & pleasantries
  const trimmed = messageText.trim();
  const isGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy|sup|yo)[!.,\s]*$/i.test(trimmed);

  // 4. Retrieve relevant published knowledge base entries
  const relevantKb = isGreeting ? [] : await getPublishedArticles(messageText);

  let aiResult = null;

  if (isGreeting) {
    aiResult = {
      response:
        "Hello! Welcome to HELPDESK AI. How can I assist you today? You can ask me about our 30-day refund policy, account password reset, real-time package tracking, or request to speak with a human support specialist.",
      intent: 'general_inquiry',
      sentiment: 'positive',
      confidence: 0.99,
      requires_human: false,
      suggested_action: 'provide_information',
      related_articles: ['30-Day Money Back & Refund Policy', 'Password Reset & Account Recovery'],
      clarification_question: null
    };
  } else {
    // Generate AI response via Gemini
    const prompt = buildChatPrompt({
      userMessage: messageText,
      conversationHistory: history,
      knowledgeBase: relevantKb.slice(0, 4)
    });

    aiResult = await callGemini({
      prompt,
      schema: aiChatResponseSchema
    });
  }

  // Resilient grounding fallback if Gemini is offline or did not answer
  if (!aiResult) {
    const lower = messageText.toLowerCase();
    const escalationRequested =
      lower.includes('escalat') ||
      lower.includes('human') ||
      lower.includes('speak with agent') ||
      lower.includes('talk to someone') ||
      lower.includes('not working') ||
      lower.includes('broken');

    if (escalationRequested) {
      aiResult = {
        response:
          "I understand you require specialized assistance. I would be happy to escalate this issue directly to our human support team. Would you like me to create a support ticket with your problem details right now?",
        intent: 'technical_issue',
        sentiment: 'negative',
        confidence: 0.95,
        requires_human: true,
        suggested_action: 'escalate_to_human',
        related_articles: ['Human Support Escalation Workflow'],
        clarification_question: null
      };
    } else {
      // Find matching KB article if any
      const matchedKb = relevantKb[0];
      if (matchedKb) {
        aiResult = {
          response: `${matchedKb.answer} (Referenced from: "${matchedKb.title}")`,
          intent: matchedKb.title.toLowerCase().includes('refund') ? 'billing_inquiry' : 'general_inquiry',
          sentiment: 'neutral',
          confidence: 0.92,
          requires_human: false,
          suggested_action: 'recommend_article',
          related_articles: [matchedKb.title],
          clarification_question: 'Does this answer your question or would you like more information?'
        };
      } else {
        aiResult = {
          response:
            "Thank you for contacting HELPDESK AI. I can assist you with account access, billing queries, order tracking, and refund requests based on our official knowledge base. Could you please specify more details about your inquiry?",
          intent: 'general_inquiry',
          sentiment: 'neutral',
          confidence: 0.85,
          requires_human: false,
          suggested_action: 'ask_clarification',
          related_articles: [],
          clarification_question: null
        };
      }
    }
  }

  // 5. Store customer message and AI response
  const customerMsg = {
    conversation_id: currentConversationId,
    sender_id: customerId,
    sender_type: 'customer',
    content: messageText,
    metadata: {}
  };

  const aiMsg = {
    conversation_id: currentConversationId,
    sender_id: null,
    sender_type: 'ai',
    content: aiResult.response,
    metadata: {
      intent: aiResult.intent,
      sentiment: aiResult.sentiment,
      confidence: aiResult.confidence,
      requires_human: aiResult.requires_human,
      suggested_action: aiResult.suggested_action,
      related_articles: aiResult.related_articles,
      clarification_question: aiResult.clarification_question
    }
  };

  let savedLive = false;
  if (isLiveConfigured && supabase) {
    try {
      const { error: msgErr } = await supabase.from('messages').insert([customerMsg, aiMsg]);
      if (!msgErr) savedLive = true;
    } catch (e) {}
  }

  // Always keep localStore in sync too so local queries also find them!
  const custRecord = {
    id: generateUuid(),
    ...customerMsg,
    created_at: new Date().toISOString()
  };
  const aiRecord = {
    id: generateUuid(),
    ...aiMsg,
    created_at: new Date(Date.now() + 200).toISOString()
  };
  localStore.messages.push(custRecord, aiRecord);

  if (!localStore.conversations.some((c) => c.id === currentConversationId)) {
    localStore.conversations.unshift({
      id: currentConversationId,
      customer_id: customerId,
      title: messageText.slice(0, 45) + (messageText.length > 45 ? '...' : ''),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return {
    conversation_id: currentConversationId,
    ai_response: aiResult,
    user_message: messageText
  };
};

export const getCustomerConversations = async (customerId) => {
  let liveConvs = [];
  if (isLiveConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, messages(id, sender_type, content, created_at)')
        .eq('customer_id', customerId)
        .order('updated_at', { ascending: false });
      if (!error && data && data.length > 0) {
        liveConvs = data;
      }
    } catch (err) {
      logger.warn({ error: err.message }, 'Live conversations query failed, checking localStore');
    }
  }

  const localConvs = localStore.conversations
    .filter((c) => c.customer_id === customerId)
    .map((c) => {
      const msgs = localStore.messages
        .filter((m) => m.conversation_id === c.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return {
        ...c,
        messages: msgs
      };
    });

  const combined = [...liveConvs];
  for (const lc of localConvs) {
    if (!combined.some((item) => item.id === lc.id)) {
      combined.push(lc);
    }
  }

  return combined.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
};

export const getConversationById = async (conversationId, customerId, userRole) => {
  if (isLiveConfigured && supabase) {
    try {
      let q = supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('id', conversationId);
      if (userRole === 'customer') {
        q = q.eq('customer_id', customerId);
      }
      const { data, error } = await q.single();
      if (!error && data) {
        if (data.messages) {
          data.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        return data;
      }
    } catch (err) {}
  }

  const conv = localStore.conversations.find((c) => c.id === conversationId);
  if (!conv) return null;
  if (userRole === 'customer' && conv.customer_id !== customerId) {
    return null;
  }

  const msgs = localStore.messages
    .filter((m) => m.conversation_id === conv.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return {
    ...conv,
    messages: msgs
  };
};
