import { z } from 'zod';

export const createKnowledgeBaseSchema = z.object({
  title: z.string().trim().min(3).max(200),
  question: z.string().trim().min(5).max(500),
  answer: z.string().trim().min(10).max(10000),
  category_id: z.string().uuid().optional().nullable(),
  keywords: z.array(z.string()).default([]).optional(),
  is_published: z.boolean().default(false).optional()
});

export const updateKnowledgeBaseSchema = createKnowledgeBaseSchema.partial();

