export const buildClassificationPrompt = ({ subject, description, availableCategories = [] }) => {
  const categoriesList = availableCategories.length > 0
    ? availableCategories.map((c) => c.name).join(', ')
    : 'Technical Support, Billing & Payments, Account Management, Orders & Delivery, Refunds & Returns, Product Information, General Inquiry, Complaints, Other';

  return `Analyze the ticket subject and description.
Determine the most appropriate category, priority, customer sentiment, and recommended action.
Available categories to choose from: [${categoriesList}].

Return structured JSON only matching the schema:
{
  "category": "one of the available categories",
  "priority": "low" | "medium" | "high" | "urgent",
  "sentiment": "positive" | "neutral" | "negative",
  "intent": "technical_issue" | "billing_inquiry" | "account_issue" | "order_tracking" | "refund_request" | "complaint" | "product_information" | "general_inquiry" | "other",
  "summary": "Short 1-2 sentence problem summary",
  "recommended_action": "Recommended next step for the support agent",
  "confidence": 0.95
}

TICKET SUBJECT:
${subject}

TICKET DESCRIPTION:
${description}
`;
};

