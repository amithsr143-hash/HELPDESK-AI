import { callGemini } from './gemini.service.js';
import { buildSummaryPrompt } from '../prompts/summary.prompt.js';
import { aiSummaryResponseSchema } from '../schemas/ai-output.schema.js';

export const generateTicketSummary = async (subject, description, responses = []) => {
  const prompt = buildSummaryPrompt({ subject, description, responses });
  const geminiResult = await callGemini({
    prompt,
    schema: aiSummaryResponseSchema
  });

  if (geminiResult) {
    return geminiResult;
  }

  // Resilient heuristic summary
  const lastResponse = responses[responses.length - 1];
  return {
    problem: subject,
    previous_actions: responses.length > 0
      ? [`${responses.length} response(s) exchanged between customer and agent`]
      : ['Initial ticket submitted by customer'],
    current_status: lastResponse ? `Last message: "${lastResponse.message.slice(0, 70)}..."` : 'Pending initial agent triage',
    expected_resolution: 'Complete investigation and confirm customer satisfaction',
    summary: `${subject}. Customer issue under active review.`
  };
};

