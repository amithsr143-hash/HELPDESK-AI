import { z } from 'zod';

export const aiChatResponseSchema = z.object({
  response: z.string(),
  intent: z.string().default('general_inquiry'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).catch('neutral').default('neutral'),
  confidence: z.number().catch(0.95).default(0.9),
  requires_human: z.boolean().catch(false).default(false),
  suggested_action: z.string().default('provide_information'),
  related_articles: z.array(z.string()).catch([]).default([]),
  clarification_question: z.string().nullable().optional()
});

export const aiClassificationResponseSchema = z.object({
  category: z.string().default('General Inquiry'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
  intent: z.string().default('general_inquiry'),
  summary: z.string(),
  recommended_action: z.string(),
  confidence: z.number().min(0).max(1).default(0.9)
});

export const aiSummaryResponseSchema = z.object({
  problem: z.string(),
  previous_actions: z.array(z.string()).default([]),
  current_status: z.string(),
  expected_resolution: z.string(),
  summary: z.string()
});

export const aiSentimentResponseSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  reason: z.string(),
  confidence: z.number().min(0).max(1).default(0.9)
});

export const aiAnalyticsResponseSchema = z.object({
  overall_summary: z.string(),
  top_issues: z.array(
    z.object({
      issue: z.string(),
      frequency: z.number(),
      recommendation: z.string()
    })
  ).default([]),
  sentiment_overview: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number()
  }).default({ positive: 0, neutral: 0, negative: 0 }),
  improvement_suggestions: z.array(z.string()).default([]),
  priority_recommendations: z.array(z.string()).default([])
});

