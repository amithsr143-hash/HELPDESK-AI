-- 006_seed_data.sql: Seed Data for Categories and Knowledge Base

-- Insert default categories
INSERT INTO public.ticket_categories (name, description, is_active)
VALUES 
    ('Technical Support', 'Technical problems, bug reports, and software troubleshooting', TRUE),
    ('Billing & Payments', 'Invoices, payment failures, credit card updates, and billing cycles', TRUE),
    ('Account Management', 'Login issues, password recovery, profile settings, and 2FA access', TRUE),
    ('Orders & Delivery', 'Order status inquiries, tracking numbers, delays, and address changes', TRUE),
    ('Refunds & Returns', 'Return authorizations, refund eligibility, and status of reversed payments', TRUE),
    ('Product Information', 'Features, specifications, documentation, and pricing plans', TRUE),
    ('General Inquiry', 'General questions about company services, office hours, and contact info', TRUE),
    ('Complaints', 'Escalated service dissatisfaction, unresolved delays, and feedback', TRUE),
    ('Other', 'Unclassified questions and custom requests', TRUE)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- Insert published Knowledge Base articles
INSERT INTO public.knowledge_base (title, question, answer, keywords, is_published)
VALUES 
(
    'Password Reset Guide',
    'How do I reset my account password if I forgot it?',
    'To reset your password, navigate to the Login page and click on "Forgot Password?". Enter your registered email address to receive a secure password reset link. Click the link within 60 minutes, enter your new password (minimum 8 characters with a mix of letters and numbers), and save changes.',
    ARRAY['password', 'reset', 'login', 'account', 'security', 'forgot password'],
    TRUE
),
(
    'Standard Refund & Return Policy',
    'What is your refund and return policy for subscriptions and purchases?',
    'We offer a 30-day money-back guarantee on all software subscription tiers and eligible hardware orders. To initiate a refund, please ensure your request is submitted within 30 days of the transaction date. Subscriptions cancelled after 30 days remain active until the end of the billing cycle without automatic renewal. Refunds are processed back to the original payment method within 5-7 business days.',
    ARRAY['refund', 'return', 'money back', 'billing', 'cancellation', 'policy'],
    TRUE
),
(
    'Order Delivery Tracking',
    'How can I track my package or delivery progress?',
    'Once your order has shipped, you will receive an email confirmation with your carrier tracking number (FedEx, UPS, or DHL). You can also view real-time tracking by visiting your Customer Portal under "Orders & Delivery" and entering your order reference number.',
    ARRAY['order', 'shipping', 'tracking', 'delivery', 'status', 'package'],
    TRUE
),
(
    'Supported Payment Methods',
    'Which payment methods are accepted and how does recurring billing work?',
    'We accept major credit cards (Visa, MasterCard, American Express), PayPal, and direct SEPA/ACH bank transfers for enterprise accounts. Subscriptions are billed automatically at the start of each monthly or annual cycle. Invoices and receipts can be downloaded anytime from the Billing tab.',
    ARRAY['payment', 'credit card', 'paypal', 'invoice', 'billing cycle', 'receipt'],
    TRUE
),
(
    'Two-Factor Authentication Setup & Troubleshooting',
    'How do I configure or troubleshoot Two-Factor Authentication (2FA)?',
    'You can enable 2FA from your Profile Security settings using any standard TOTP authenticator app (Google Authenticator, Authy, or 1Password). If you are locked out or lost your device, use one of the backup recovery codes provided during setup or contact our support team with verification credentials.',
    ARRAY['2fa', 'two factor', 'security', 'authenticator', 'totp', 'backup codes'],
    TRUE
),
(
    'How to Escalate to a Human Support Specialist',
    'When and how will my issue be escalated to a human support agent?',
    'Our intelligent AI assistant can resolve most common queries instantly. If your inquiry requires account-specific investigation, refund approvals, or technical debugging, the AI will automatically ask if you wish to escalate. Upon confirmation, a support ticket is created and routed directly to a specialist in the appropriate department.',
    ARRAY['escalation', 'human agent', 'support ticket', 'representative', 'helpdesk'],
    TRUE
);

