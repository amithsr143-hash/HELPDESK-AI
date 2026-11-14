// Helper UUID generator in pure JS to avoid external dependency issues if not installed
const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

class LocalDataStore {
  constructor() {
    this.profiles = [];
    this.ticket_categories = [];
    this.tickets = [];
    this.conversations = [];
    this.messages = [];
    this.ticket_responses = [];
    this.ticket_activity = [];
    this.knowledge_base = [];
    this.notifications = [];
    this.feedback = [];
    this.ai_analytics = [];
    this.ticketCounter = 1000;

    this.initSeedData();
  }

  initSeedData() {
    // 1. Initial Default Profiles (Customer, Agent, Admin)
    const adminId = 'a0000000-0000-4000-8000-000000000001';
    const agentId = 'a0000000-0000-4000-8000-000000000002';
    const customerId = 'a0000000-0000-4000-8000-000000000003';

    this.profiles = [
      {
        id: adminId,
        full_name: 'Sarah Connor (Admin)',
        email: 'admin@helpdesk.ai',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        phone: '+1-555-0101',
        is_active: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: agentId,
        full_name: 'Alex Rivera (Agent)',
        email: 'agent@helpdesk.ai',
        role: 'agent',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: '+1-555-0102',
        is_active: true,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: customerId,
        full_name: 'David Miller (Customer)',
        email: 'customer@helpdesk.ai',
        role: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        phone: '+1-555-0103',
        is_active: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // 2. Ticket Categories
    const catTechId = 'c0000000-0000-4000-8000-000000000001';
    const catBillingId = 'c0000000-0000-4000-8000-000000000002';
    const catAccountId = 'c0000000-0000-4000-8000-000000000003';
    const catOrdersId = 'c0000000-0000-4000-8000-000000000004';
    const catRefundsId = 'c0000000-0000-4000-8000-000000000005';
    const catGeneralId = 'c0000000-0000-4000-8000-000000000006';

    this.ticket_categories = [
      { id: catTechId, name: 'Technical Support', description: 'Technical glitches, bugs, and API integration', is_active: true },
      { id: catBillingId, name: 'Billing & Payments', description: 'Subscriptions, invoice issues, credit card queries', is_active: true },
      { id: catAccountId, name: 'Account Management', description: 'Logins, 2FA, password resets, permissions', is_active: true },
      { id: catOrdersId, name: 'Orders & Delivery', description: 'Shipments, order statuses, tracking info', is_active: true },
      { id: catRefundsId, name: 'Refunds & Returns', description: 'Refund processing and 30-day money back guarantee', is_active: true },
      { id: catGeneralId, name: 'General Inquiry', description: 'General questions, feature suggestions', is_active: true }
    ];

    // 3. Knowledge Base
    this.knowledge_base = [
      {
        id: generateUuid(),
        title: 'Password Reset & Account Recovery',
        question: 'How do I reset my account password if I cannot log in?',
        answer: 'Navigate to the Login page and click on "Forgot Password?". Enter your registered email address to receive a secure password reset link. Click the link within 60 minutes, enter your new password (minimum 8 characters), and confirm changes.',
        category_id: catAccountId,
        keywords: ['password', 'reset', 'login', 'account', 'security', 'forgot password'],
        is_published: true,
        created_by: adminId,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateUuid(),
        title: '30-Day Money Back & Refund Policy',
        question: 'What is your refund policy for subscriptions and purchases?',
        answer: 'We offer a 30-day money-back guarantee on all software subscriptions and eligible purchases. To request a refund, submit a support ticket under the "Refunds & Returns" category within 30 days of billing. Approved refunds are credited back to your original payment method in 5-7 business days.',
        category_id: catRefundsId,
        keywords: ['refund', 'money back', 'billing', 'cancellation', 'policy', 'return'],
        is_published: true,
        created_by: adminId,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateUuid(),
        title: 'Real-Time Package & Delivery Tracking',
        question: 'How do I track my delivery status and shipping carrier?',
        answer: 'As soon as your shipment is dispatched, you will receive a tracking link from FedEx/DHL via email. You can also view shipping milestones in your customer dashboard under "Orders & Delivery" using your order tracking reference number.',
        category_id: catOrdersId,
        keywords: ['order', 'tracking', 'shipping', 'delivery', 'fedex', 'package'],
        is_published: true,
        created_by: adminId,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateUuid(),
        title: 'Accepted Payment Methods and Invoices',
        question: 'Which payment methods are accepted and how can I view invoices?',
        answer: 'We accept Visa, MasterCard, American Express, PayPal, and wire transfers for annual enterprise contracts. All past invoices and tax receipts are available for instant PDF download in the Billing section of your dashboard.',
        category_id: catBillingId,
        keywords: ['payment', 'credit card', 'paypal', 'invoice', 'billing', 'receipt'],
        is_published: true,
        created_by: adminId,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateUuid(),
        title: 'Human Support Escalation Workflow',
        question: 'How can I speak directly with a human support agent?',
        answer: 'Our AI Chatbot resolves most immediate questions in seconds. If your issue requires personalized verification or technical debugging, the AI will prompt you to create an escalated ticket. Once created, an assigned human agent will review your issue and reply directly.',
        category_id: catGeneralId,
        keywords: ['escalate', 'human support', 'agent', 'helpdesk', 'representative'],
        is_published: true,
        created_by: adminId,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // 4. Initial Seed Tickets with real conversation, activity, and feedback
    const ticket1Id = 't0000000-0000-4000-8000-000000000001';
    const ticket2Id = 't0000000-0000-4000-8000-000000000002';
    const ticket3Id = 't0000000-0000-4000-8000-000000000003';

    this.tickets = [
      {
        id: ticket1Id,
        ticket_number: ++this.ticketCounter,
        customer_id: customerId,
        assigned_agent_id: agentId,
        category_id: catTechId,
        subject: 'API Webhook timeouts on high volume events',
        description: 'We are observing occasional 504 gateway timeouts when our server sends webhook payload bursts over 100 req/sec.',
        ai_summary: 'Customer reports 504 timeouts on webhook bursts above 100 req/sec. Requires API throughput rate check.',
        ai_sentiment: 'negative',
        ai_suggested_priority: 'high',
        priority: 'high',
        status: 'in_progress',
        resolution_notes: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: ticket2Id,
        ticket_number: ++this.ticketCounter,
        customer_id: customerId,
        assigned_agent_id: agentId,
        category_id: catBillingId,
        subject: 'Double charge on renewal invoice #INV-4921',
        description: 'My corporate card was charged twice on the monthly billing cycle renewal yesterday. Please review and refund the duplicate.',
        ai_summary: 'Duplicate credit card transaction on monthly renewal invoice #INV-4921. Needs payment gateway reconciliation and refund.',
        ai_sentiment: 'negative',
        ai_suggested_priority: 'urgent',
        priority: 'urgent',
        status: 'resolved',
        resolution_notes: 'Duplicate transaction refunded via Stripe gateway transaction ref #tx_981249. Settled in 3-5 business days.',
        resolved_at: new Date(Date.now() - 6 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 3600000).toISOString()
      },
      {
        id: ticket3Id,
        ticket_number: ++this.ticketCounter,
        customer_id: customerId,
        assigned_agent_id: null,
        category_id: catOrdersId,
        subject: 'Package tracking status stuck at distribution center',
        description: 'Tracking number FX-92841 has shown no movement for 4 days at the regional distribution facility.',
        ai_summary: 'Courier package stalled at distribution center for 4 days. Customer requesting shipping carrier trace.',
        ai_sentiment: 'neutral',
        ai_suggested_priority: 'medium',
        priority: 'medium',
        status: 'open',
        resolution_notes: null,
        resolved_at: null,
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ];

    // 5. Ticket Responses
    this.ticket_responses = [
      {
        id: generateUuid(),
        ticket_id: ticket1Id,
        sender_id: agentId,
        message: 'Hello David, thank you for reaching out. Our engineering team is reviewing the concurrency limits on our webhook ingest cluster. I will update you as soon as our log trace completes.',
        is_internal: false,
        created_at: new Date(Date.now() - 36 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        ticket_id: ticket1Id,
        sender_id: agentId,
        message: 'Internal note: checked Cloudflare edge rules. Rate limiter is throttling burst spikes.',
        is_internal: true,
        created_at: new Date(Date.now() - 30 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        ticket_id: ticket2Id,
        sender_id: agentId,
        message: 'Hi David, I have processed the refund for the duplicate transaction of $49.00. You should see the credit reflected on your statement within 3 to 5 business days.',
        is_internal: false,
        created_at: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ];

    // 6. Ticket Activity
    this.ticket_activity = [
      {
        id: generateUuid(),
        ticket_id: ticket1Id,
        actor_id: customerId,
        activity_type: 'ticket_created',
        old_value: null,
        new_value: { subject: 'API Webhook timeouts on high volume events', priority: 'high', status: 'open' },
        created_at: new Date(Date.now() - 48 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        ticket_id: ticket1Id,
        actor_id: adminId,
        activity_type: 'agent_assigned',
        old_value: null,
        new_value: { agent_id: agentId },
        created_at: new Date(Date.now() - 46 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        ticket_id: ticket1Id,
        actor_id: agentId,
        activity_type: 'status_changed',
        old_value: { status: 'open' },
        new_value: { status: 'in_progress' },
        created_at: new Date(Date.now() - 36 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        ticket_id: ticket2Id,
        actor_id: agentId,
        activity_type: 'status_changed',
        old_value: { status: 'in_progress' },
        new_value: { status: 'resolved' },
        created_at: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ];

    // 7. Feedback on Resolved Ticket 2
    this.feedback = [
      {
        id: generateUuid(),
        ticket_id: ticket2Id,
        customer_id: customerId,
        rating: 5,
        comment: 'Super fast turnaround! The agent resolved the duplicate charge within hours. Outstanding support.',
        created_at: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ];

    // 8. Notifications
    this.notifications = [
      {
        id: generateUuid(),
        user_id: customerId,
        title: 'Ticket #1002 Resolved',
        message: 'Your ticket regarding the duplicate billing charge has been resolved.',
        notification_type: 'status_changed',
        related_ticket_id: ticket2Id,
        is_read: false,
        created_at: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        user_id: customerId,
        title: 'Agent Response: Ticket #1001',
        message: 'Agent Alex Rivera replied to your ticket regarding API Webhook timeouts.',
        notification_type: 'agent_responded',
        related_ticket_id: ticket1Id,
        is_read: true,
        created_at: new Date(Date.now() - 35 * 3600000).toISOString()
      },
      {
        id: generateUuid(),
        user_id: agentId,
        title: 'New Ticket Assigned: #1001',
        message: 'You have been assigned to ticket #1001: API Webhook timeouts on high volume events.',
        notification_type: 'ticket_assigned',
        related_ticket_id: ticket1Id,
        is_read: true,
        created_at: new Date(Date.now() - 46 * 3600000).toISOString()
      }
    ];

    // 9. Initial Conversation
    const conversationId = 'conv-0000-4000-8000-000000000001';
    this.conversations = [
      {
        id: conversationId,
        customer_id: customerId,
        title: 'Question regarding refund process',
        is_active: true,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];

    this.messages = [
      {
        id: generateUuid(),
        conversation_id: conversationId,
        sender_id: customerId,
        sender_type: 'customer',
        content: 'Hi, I would like to know if I can get a refund on my subscription?',
        metadata: {},
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: generateUuid(),
        conversation_id: conversationId,
        sender_id: null,
        sender_type: 'ai',
        content: 'Hello David! Yes, we offer a 30-day money-back guarantee on all software subscriptions. If your purchase was made within the last 30 days, we can easily help process your refund. Would you like me to connect you with our billing team or create a refund ticket for you?',
        metadata: {
          intent: 'refund_request',
          sentiment: 'neutral',
          confidence: 0.98,
          suggested_action: 'provide_information'
        },
        created_at: new Date(Date.now() - 1 * 86400000 + 2000).toISOString()
      }
    ];
  }
}

export const localStore = new LocalDataStore();
export { generateUuid };

