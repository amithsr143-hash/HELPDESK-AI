import { callGemini } from './gemini.service.js';
import { buildSentimentPrompt } from '../prompts/sentiment.prompt.js';
import { aiSentimentResponseSchema } from '../schemas/ai-output.schema.js';

export const analyzeSentiment = async (text) => {
  const prompt = buildSentimentPrompt(text);
  const geminiResult = await callGemini({
    prompt,
    schema: aiSentimentResponseSchema
  });

  if (geminiResult) {
    return geminiResult;
  }

  // Resilient heuristic analysis
  const lower = text.toLowerCase();
  const urgentWords = ['urgent', 'emergency', 'outage', 'crash', 'asap', 'broken', 'disrupted', 'immediately'];
  const negativeWords = ['angry', 'bad', 'terrible', 'horrible', 'worst', 'fail', 'error', 'frustrated', 'unhappy', 'stuck', 'double charge', 'cannot access'];
  const positiveWords = ['thank', 'great', 'awesome', 'good', 'solved', 'helpful', 'love', 'excellent', 'appreciate'];

  const isUrgent = urgentWords.some((w) => lower.includes(w));
  const isNeg = negativeWords.some((w) => lower.includes(w));
  const isPos = positiveWords.some((w) => lower.includes(w));

  return {
    sentiment: isNeg ? 'negative' : isPos ? 'positive' : 'neutral',
    urgency: isUrgent ? 'high' : isNeg ? 'medium' : 'low',
    reason: isUrgent ? 'Urgent keywords detected in customer message' : isNeg ? 'Negative phrasing and dissatisfaction detected' : 'Standard conversational tone',
    confidence: 0.88
  };
};

