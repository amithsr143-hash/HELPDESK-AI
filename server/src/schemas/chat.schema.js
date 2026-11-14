import { z } from 'zod';

export const chatMessageSchema = z.object({
  conversation_id: z.string().optional().nullable(),
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000)
});

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional()
});

export const escalateChatSchema = z.object({
  conversation_id: z.string().optional().nullable(),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  category_id: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium').optional()
});
