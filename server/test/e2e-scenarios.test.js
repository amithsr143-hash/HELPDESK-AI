import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('HELPDESK AI – End-to-End Scenarios (Section 22.7)', { timeout: 30000 }, () => {
  let createdTicketId = null;
  let createdTicketNumber = null;
  let conversationId = null;

  it('Scenario 1: Customer Support – Ask question to AI Chatbot with Knowledge Base grounding', async () => {
    const res = await request(app)
      .post('/api/v1/chat/message')
      .set('Authorization', 'Bearer mock-customer-token')
      .send({
        message: 'What is your 30-day refund policy for subscriptions?'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ai_response).toBeDefined();
    expect(res.body.data.ai_response.response).toBeDefined();
    expect(res.body.data.conversation_id).toBeDefined();

    conversationId = res.body.data.conversation_id;
  });

  it('Scenario 2: Ticket Escalation – Escalate unresolved issue to support ticket', async () => {
    const res = await request(app)
      .post('/api/v1/chat/escalate')
      .set('Authorization', 'Bearer mock-customer-token')
      .send({
        conversation_id: conversationId,
        subject: 'Database connection pool exhausted during peak migration',
        description: 'Our PostgreSQL connection pool is maxing out at 100 connections causing queries to fail with code 503.',
        priority: 'urgent'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.ticket_number).toBeDefined();

    createdTicketId = res.body.data.id;
    createdTicketNumber = res.body.data.ticket_number;
  });

  it('Scenario 3: AI Classification – Gemini validates category, priority, sentiment, and summary', async () => {
    const res = await request(app)
      .get(`/api/v1/tickets/${createdTicketId}`)
      .set('Authorization', 'Bearer mock-customer-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const ticket = res.body.data;

    expect(ticket.ticket_number).toBe(createdTicketNumber);
    expect(ticket.ai_summary).toBeDefined();
    expect(ticket.priority).toBeDefined();
    expect(['open', 'assigned']).toContain(ticket.status);
  });

  it('Scenario 4: Agent Resolution – Agent reviews, adds internal note, replies to customer, and resolves ticket', async () => {
    // 1. Agent adds private internal note
    const noteRes = await request(app)
      .post(`/api/v1/tickets/${createdTicketId}/responses`)
      .set('Authorization', 'Bearer mock-agent-token')
      .send({
        message: 'Internal investigation: Verified connection limit on PgBouncer proxy. Doubled pool capacity.',
        is_internal: true
      });
    expect(noteRes.status).toBe(201);
    expect(noteRes.body.data.is_internal).toBe(true);

    // 2. Agent replies to customer
    const replyRes = await request(app)
      .post(`/api/v1/tickets/${createdTicketId}/responses`)
      .set('Authorization', 'Bearer mock-agent-token')
      .send({
        message: 'Hello David, we have scaled your database connection pool from 100 to 250 connections. Please retry your migration.',
        is_internal: false
      });
    expect(replyRes.status).toBe(201);
    expect(replyRes.body.data.is_internal).toBe(false);

    // 3. Customer verifies that internal note is HIDDEN from them
    const customerView = await request(app)
      .get(`/api/v1/tickets/${createdTicketId}`)
      .set('Authorization', 'Bearer mock-customer-token');
    expect(customerView.status).toBe(200);
    const internalNotesVisibleToCustomer = customerView.body.data.responses.some((r) => r.is_internal);
    expect(internalNotesVisibleToCustomer).toBe(false);

    // 4. Agent resolves ticket
    const resolveRes = await request(app)
      .patch(`/api/v1/tickets/${createdTicketId}/status`)
      .set('Authorization', 'Bearer mock-agent-token')
      .send({
        status: 'resolved',
        resolution_notes: 'Increased PgBouncer connection limit to 250 and verified zero dropped packets.'
      });
    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('resolved');
  });

  it('Scenario 5: Customer Feedback – Customer submits satisfaction rating for resolved ticket', async () => {
    const res = await request(app)
      .post(`/api/v1/tickets/${createdTicketId}/feedback`)
      .set('Authorization', 'Bearer mock-customer-token')
      .send({
        rating: 5,
        comment: 'Outstanding and lightning fast resolution! Database migration succeeded seamlessly.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  it('Scenario 6: Administrator Analytics – Real database aggregation & Gemini AI insights', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { metrics, ai_insights } = res.body.data;

    expect(metrics.totalTickets).toBeGreaterThan(0);
    expect(metrics.resolvedTickets).toBeGreaterThan(0);
    expect(metrics.csatScore).toBeGreaterThan(0);
    expect(metrics.categoryDistribution).toBeDefined();

    expect(ai_insights.overall_summary).toBeDefined();
    expect(ai_insights.top_issues.length).toBeGreaterThan(0);
    expect(ai_insights.improvement_suggestions.length).toBeGreaterThan(0);
  });
});

