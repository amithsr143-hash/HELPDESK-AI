export const buildSentimentPrompt = (text) => {
  return `Analyze the customer's message.
Identify the sentiment and urgency.

Return structured JSON only matching the schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "urgency": "low" | "medium" | "high" | "urgent",
  "reason": "Brief reason explaining the evaluation",
  "confidence": 0.95
}

MESSAGE:
${text}
`;
};

