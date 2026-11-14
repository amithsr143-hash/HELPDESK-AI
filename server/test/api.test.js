import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('HELPDESK AI REST API Endpoints', { timeout: 25000 }, () => {
  it('GET /api/v1/health returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('HELPDESK AI API');
  });

  it('GET /api/v1/knowledge-base returns published articles', async () => {
    const res = await request(app).get('/api/v1/knowledge-base');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/auth/login validates credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer@helpdesk.ai', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('customer');
  });

  it('Enforces role authorization on admin routes', async () => {
    // Customer token accessing admin analytics
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', 'Bearer mock-customer-token');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Allows admin to access analytics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', 'Bearer mock-admin-token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.ai_insights).toBeDefined();
  });

  it('Allows customer to create and list support tickets', async () => {
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', 'Bearer mock-customer-token')
      .send({
        subject: 'Cannot access invoice PDF history',
        description: 'When clicking download invoice, a blank page is displayed.'
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.ticket_number).toBeDefined();

    const listRes = await request(app)
      .get('/api/v1/tickets')
      .set('Authorization', 'Bearer mock-customer-token');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);
  });
});

