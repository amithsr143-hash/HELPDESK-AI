# HELPDESK AI – REST API Documentation
**Tagline:** Instant Answers. Smarter Support.  
**Base URL:** `/api/v1`

---

## 1. Overview & Authentication
All protected routes require an HTTP `Authorization` header formatted as:
`Authorization: Bearer <TOKEN>`

Standard API Success Envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": null
}
```

Standard API Error Envelope:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": null
}
```

---

## 2. Authentication Endpoints

### `POST /auth/register`
Register a new customer account.
- **Body:** `{ "fullName": "string", "email": "string", "password": "min 8 chars" }`
- **Response:** `201 Created` with profile and session token.

### `POST /auth/login`
Authenticate existing user.
- **Body:** `{ "email": "string", "password": "string" }`
- **Response:** `200 OK` with profile and session token.

### `GET /auth/me`
Fetch current authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user record (`role`, `full_name`, `email`, etc.).

---

## 3. Conversational AI & Chat Endpoints

### `POST /chat/message`
Submit a message to Google Gemini conversational engine.
- **Body:** `{ "conversation_id": "UUID (optional)", "message": "string" }`
- **Processing:**
  1. Retrieves up to 10 context messages.
  2. Grounds response in published Knowledge Base FAQs.
  3. Evaluates intent, sentiment, confidence, and human escalation need.
  4. Stores customer message and AI response.
- **Response:** Structured AI output matching Zod validation schema.

### `POST /chat/escalate`
Escalate an active conversation into an official support ticket.
- **Body:** `{ "conversation_id": "UUID", "subject": "string", "description": "string", "priority": "low|medium|high|urgent" }`
- **Response:** `201 Created` with created ticket details.

---

## 4. Ticket Management Endpoints

### `POST /tickets`
Create a support ticket.
- **Body:** `{ "subject": "string", "description": "string", "category_id": "UUID", "priority": "low|medium|high|urgent" }`
- **AI Integration:** Auto-classifies category, predicts priority, assesses sentiment, generates executive summary.

### `GET /tickets`
List authorized tickets.
- **Query Params:** `status`, `priority`, `category_id`, `search`, `page`, `limit`
- **Access:** Customers see own tickets; Agents see assigned or queue; Admins see all.

### `GET /tickets/:id`
Fetch complete ticket details, conversation responses, activity audit log, and customer feedback.

### `PATCH /tickets/:id/status`
Update ticket status (`open`, `assigned`, `in_progress`, `waiting_for_customer`, `resolved`, `closed`).
- **Body:** `{ "status": "string", "resolution_notes": "string" }`

### `PATCH /tickets/:id/assign`
Assign ticket to a support agent.
- **Body:** `{ "agent_id": "UUID" }`

### `POST /tickets/:id/responses`
Add a response message to the ticket thread.
- **Body:** `{ "message": "string", "is_internal": boolean, "status_update": "string" }`
- **Note:** Customers cannot create internal notes. Internal notes are only visible to staff.

### `POST /tickets/:id/feedback`
Submit customer satisfaction rating and comment for a resolved ticket.
- **Body:** `{ "rating": 1-5, "comment": "string" }`

---

## 5. Knowledge Base Endpoints

### `GET /knowledge-base`
List published FAQ articles for customer self-service and AI grounding.
- **Query Params:** `query`, `category_id`

### `POST /knowledge-base/admin`
Admin create new FAQ article.
- **Body:** `{ "title": "string", "question": "string", "answer": "string", "keywords": [], "is_published": boolean }`

---

## 6. Administrative & Analytics Endpoints

### `GET /admin/analytics`
Fetches real PostgreSQL aggregated statistics and Google Gemini AI Customer Experience recommendations.
- **Response:** `{ "metrics": { ... }, "ai_insights": { "overall_summary", "top_issues", "sentiment_overview", "improvement_suggestions", "priority_recommendations" } }`

