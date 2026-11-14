import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.enum(['customer', 'agent', 'admin']).default('customer').optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable()
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'agent', 'admin'])
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean()
});

