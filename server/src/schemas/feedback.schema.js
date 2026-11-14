import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().max(1000).optional().nullable()
});

