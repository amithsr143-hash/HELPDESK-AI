import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../src/schemas/auth.schema.js';
import { createTicketSchema } from '../src/schemas/ticket.schema.js';
import { submitFeedbackSchema } from '../src/schemas/feedback.schema.js';
import { aiClassificationResponseSchema, aiChatResponseSchema } from '../src/schemas/ai-output.schema.js';

describe('Zod Validation Schemas', () => {
  it('validates correct registration data', () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects short passwords under 8 characters', () => {
    const invalidData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'short'
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates ticket creation schema', () => {
    const validTicket = {
      subject: 'Webhook timeout issues on high load',
      description: 'Our servers are experiencing 504 gateway timeouts when sending bursts.',
      priority: 'high'
    };
    const result = createTicketSchema.safeParse(validTicket);
    expect(result.success).toBe(true);
  });

  it('validates customer feedback rating constraints (1-5)', () => {
    const validFeedback = { rating: 5, comment: 'Great service!' };
    expect(submitFeedbackSchema.safeParse(validFeedback).success).toBe(true);

    const invalidFeedback = { rating: 6 };
    expect(submitFeedbackSchema.safeParse(invalidFeedback).success).toBe(false);
  });

  it('validates structured AI classification output', () => {
    const validAiOutput = {
      category: 'Technical Support',
      priority: 'high',
      sentiment: 'negative',
      intent: 'technical_issue',
      summary: 'Webhook timeouts on high load',
      recommended_action: 'Check API gateway burst rate limit',
      confidence: 0.95
    };
    const result = aiClassificationResponseSchema.safeParse(validAiOutput);
    expect(result.success).toBe(true);
  });

  it('validates structured AI chat response output', () => {
    const validChatOutput = {
      response: 'We offer a 30-day money-back guarantee on all subscription plans.',
      intent: 'refund_request',
      sentiment: 'neutral',
      confidence: 0.98,
      requires_human: false,
      suggested_action: 'provide_information',
      related_articles: ['Standard Refund Policy'],
      clarification_question: null
    };
    const result = aiChatResponseSchema.safeParse(validChatOutput);
    expect(result.success).toBe(true);
  });
});

