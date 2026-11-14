import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  category_id: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium').optional(),
  preferred_contact_method: z.string().optional()
});

export const updateTicketSchema = z.object({
  subject: z.string().trim().min(5).max(150).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  category_id: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['open', 'assigned', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']).optional(),
  resolution_notes: z.string().optional().nullable()
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']),
  resolution_notes: z.string().optional().nullable()
});

export const assignAgentSchema = z.object({
  agent_id: z.string().optional().nullable()
});

export const createTicketResponseSchema = z.object({
  message: z.string().trim().min(1, 'Response cannot be empty').max(5000),
  is_internal: z.boolean().default(false).optional(),
  status_update: z.enum(['open', 'assigned', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']).optional()
});
