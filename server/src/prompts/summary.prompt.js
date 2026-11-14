export const buildSummaryPrompt = ({ subject, description, responses = [] }) => {
  const responsesText = responses
    .map((r) => `${r.sender_name || 'Agent/Customer'}: ${r.message}`)
    .join('\n');

  return `Summarize the support ticket and relevant conversation history.
Highlight the main problem, previous troubleshooting, current situation, and expected resolution.
Do not include unsupported assumptions.

Return structured JSON only matching the schema:
{
  "problem": "Main customer problem",
  "previous_actions": ["Action already attempted"],
  "current_status": "Current situation description",
  "expected_resolution": "What is needed to close this ticket",
  "summary": "Concise 2-3 sentence executive summary"
}

SUBJECT: ${subject}
DESCRIPTION: ${description}
HISTORY:
${responsesText || 'No responses yet.'}
`;
};

