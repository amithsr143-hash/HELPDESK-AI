export const buildAnalyticsPrompt = (aggregatedData) => {
  return `Analyze the supplied aggregated customer support data.
Identify recurring problems, customer satisfaction trends, ticket resolution patterns, and actionable improvements.
Use only the supplied data.
Do not invent statistics or claim unsupported correlations.

Return structured JSON only matching the schema:
{
  "overall_summary": "Customer support performance summary",
  "top_issues": [
    {
      "issue": "Specific recurring issue name",
      "frequency": 24,
      "recommendation": "Actionable step to eliminate or reduce this problem"
    }
  ],
  "sentiment_overview": {
    "positive": 35,
    "neutral": 40,
    "negative": 25
  },
  "improvement_suggestions": [
    "Concrete recommendation for process or FAQ improvement"
  ],
  "priority_recommendations": [
    "Immediate operational priority"
  ]
}

AGGREGATED METRICS:
${JSON.stringify(aggregatedData, null, 2)}
`;
};

