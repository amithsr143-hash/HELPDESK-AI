export const buildChatPrompt = ({ userMessage, conversationHistory = [], knowledgeBase = [] }) => {
  const historyText = conversationHistory
    .map((msg) => `${msg.sender_type.toUpperCase()}: ${msg.content}`)
    .join('\n');

  const kbText = knowledgeBase.length > 0
    ? knowledgeBase.map((kb, idx) => `[Doc ${idx + 1}] Title: ${kb.title}\nQ: ${kb.question}\nA: ${kb.answer}`).join('\n\n')
    : 'No relevant knowledge base articles found for this topic.';

  return `Analyze the customer's message and generate an appropriate customer support response.
Use the supplied knowledge base and conversation history.
Do not invent information.
Determine whether human support is required.
Return structured JSON only matching the schema:
{
  "response": "Helpful response for the customer",
  "intent": "general_inquiry" | "technical_issue" | "billing_inquiry" | "refund_request" | "account_issue" | "order_tracking" | "complaint" | "product_information" | "other",
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.95,
  "requires_human": false,
  "suggested_action": "provide_information" | "ask_clarification" | "recommend_article" | "escalate_to_human",
  "related_articles": ["Article Title"],
  "clarification_question": null
}

KNOWLEDGE BASE:
${kbText}

CONVERSATION HISTORY:
${historyText || 'No previous messages.'}

CURRENT CUSTOMER MESSAGE:
${userMessage}
`;
};

