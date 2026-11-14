import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS || 50000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.NODE_ENV === 'development' || req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    details: null
  }
});


