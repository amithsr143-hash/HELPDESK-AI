import { z } from 'zod';

export const markNotificationReadSchema = z.object({
  is_read: z.boolean().default(true).optional()
});

